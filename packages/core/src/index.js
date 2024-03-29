import objectPath from '@iresine/object-path';
import {getControlledPromise} from './utils.js'
import {isEmptyObject, isObject, setAdd, setUniq} from '@iresine/helpers';

class Model {
  constructor(storeId) {
    this.storeId = storeId;
  }
  parents = new Set();
  get children() {
    return new Set(this.refs.values());
  }
  refs = new Map();
  requestTime = null;
  prepared = null;

  listeners = new Set();
}

class Iresine {
  constructor({getId, hooks = {}, maxEntities, maxRequests} = {}) {
    if (hooks.join) {
      this._hooks.join = hooks.join;
    }
    if (hooks.insert) {
      this._hooks.insert = hooks.insert;
    }
    if (maxEntities) {
      this._maxEntities = maxEntities;
    }
    if (maxRequests) {
      this._maxRequests = maxRequests;
    }
    if (getId) {
      this._getId = getId;
    }
  }
  _maxRequests = 10;
  _maxEntities = 300;
  _hooks = {
    join: null,
    insert: null,
  };
  _getId(entity) {
    if (!entity) {
      return null;
    }
    if (!entity.id) {
      return null;
    }
    if (!entity.type) {
      return null;
    }
    return `${entity.type}:${entity.id}`;
  }
  _isTemplate(data) {
    return this._getId(data) !== null;
  }
  _getStructureType(data) {
    if (Array.isArray(data)) {
      return 'array';
    }
    if (this._isTemplate(data)) {
      return 'template';
    }
    if (isObject(data)) {
      return 'object';
    }
    return 'unknown';
  }

  requestTime = null;
  models = new Map();
  updated = new Set();
  processUpdated = new Set();
  entities = 0;
  currentRequest = null
  requests = [];
  processing = false;

  async parse(data, {listener, time = Date.now()} = {}) {
    const structureType = this._getStructureType(data);
    if (structureType === 'unknown') {
      return null;
    }

    const promise = getControlledPromise()

    this.requests.push({promise, data, time, listener});

    if (!this.processing) {
      this.processing = true;
      this.process();
    }

    return promise;
  }

  async process() {
    let requestCount;
    for (let i = 0; i < this.requests.length; i++) {
      const request = this.requests[i];

      this.requestTime = request.time;
      this.currentRequest = request
      request.result = await this._parse(request.data);
      this.currentRequest = null
      this.requestTime = null;
      setAdd(this.processUpdated, this.updated);
      this.updated.clear();

      if (i + 1 >= this._maxRequests || i + 1 === this.requests.length) {
        requestCount = i + 1;
        break;
      }
    }

    for (let i = 0; i < requestCount; i++) {
      const request = this.requests[i];
      if (request.listener) {
        this.subscribe(request.result.refs.values(), request.listener);
      }
      request.promise.resolve(request.result);
    }
    const parents = await this._reconciliation(this.processUpdated.values());
    this._notify(new Set([...this.processUpdated, ...parents]));
    this.requests = this.requests.slice(requestCount);

    this.processUpdated.clear();
    if (this.requests.length > 0) {
      await new Promise(setImmediate);
      this.process();
    } else {
      this.processing = false;
    }
  }

  async join(storeId) {
    if (this.entities >= this._maxEntities) {
      await new Promise(setImmediate);
      this.entities = 0;
    }
    this.entities++;

    const model = this.models.get(storeId);
    const templateObj = objectPath.joinTemplate(model.template);
    model.prepared = templateObj;

    for (let [path, storeId] of model.refs) {
      const templateObjChild = await this.get(this.models.get(storeId).storeId);
      objectPath.set(templateObj, path, templateObjChild);
    }

    if (this._hooks.join) {
      this._hooks.join(templateObj);
    }
    return templateObj;
  }

  async get(storeId) {
    const model = this.models.get(storeId);
    if (model.prepared) {
      return model.prepared;
    }
    // insert in model prepared
    await this.join(storeId);
    return model.prepared;
  }

  subscribe(modelIds, listener) {
    for (const modelId of modelIds) {
      this.models.get(modelId).listeners.add(listener);
    }
  }
  unsubscribe(modelsIds, listener) {
    for (const modelId of modelsIds) {
      this.models.get(modelId).listeners.delete(listener);
    }
  }
  async joinRefs(template, refs) {
    if (refs.size === 1 && [...refs.keys()][0].length === 0) {
      return await this.get([...refs.values()][0]);
    }

    const base = objectPath.joinTemplate(template);
    for (const [path, modelId] of refs.entries()) {
      objectPath.set(base, path, await this.get(modelId));
    }

    return base;
  }
  _notify(storeIds) {
    const listeners = new Set();
    for (const storeId of storeIds) {
      const model = this.models.get(storeId);
      for (const listener of model.listeners) {
        listeners.add(listener);
      }
    }
    for (const listener of listeners) {
      listener([...storeIds]);
    }
  }
  async _reconciliation(storedIds) {
    const parents = new Set();
    for (const storeId of storedIds) {
      const model = this.models.get(storeId);
      for (const parentId of model.parents) {
        parents.add(parentId);
      }
    }

    for (const modelId of parents) {
      if (this.processUpdated.has(modelId)) {
        continue;
      }
      const model = this.models.get(modelId);

      for (const parentModelId of model.parents.values()) {
        parents.add(parentModelId);
      }

      model.prepared = null;
    }

    for (const modelId of parents) {
      if (this.processUpdated.has(modelId)) {
        continue;
      }
      await this.join(modelId);
    }

    return parents;
  }
  async _insert(storeId, rawTemplate, parentModelsId) {
    // for recursive
    if (this.updated.has(storeId)) {
      return;
    }

    if (this.entities >= this._maxEntities) {
      await new Promise(setImmediate);
      this.entities = 0;
    }
    this.entities++;

    let model = this.models.get(storeId);
    let oldChildren = null;

    if (!model) {
      this.models.set(storeId, new Model(storeId));
      model = this.models.get(storeId);
    } else {
      oldChildren = model.children;
    }
    this.updated.add(storeId);

    model.prepared = rawTemplate;

    const {refs, template} = await this._parse(rawTemplate, {
      parentModel: model,
      omitNextTemplate: true,
    });
    model.refs = refs;
    model.template = template;

    if (oldChildren) {
      const childrenToRemove = setUniq(oldChildren, model.children);
      for (const childToRemove of childrenToRemove) {
        this.models.get(childToRemove).parents.delete(model.storeId);
      }
    }

    if (parentModelsId) {
      setAdd(model.parents, parentModelsId);
    }
  }
  async _parseNew(data, {parentModel, omitNextTemplate = false} = {}) {
    const fields = [[[], data]];
    const template = [[[], Array.isArray(data) ? [] : {}]];
    const refs = new Map();

    for (let i = 0; i < fields.length; i++) {
      if (i === 1) {
        omitNextTemplate = false;
      }
      const field = fields[i];

      const path = field[0];
      const data = field[1];

      const structureType = this._getStructureType(data);

      if (structureType === 'unknown') {
        template.push([path, data]);
        continue;
      }
      if (structureType === 'template' && omitNextTemplate === false) {
        const childModelId = this._getId(data);

        refs.set(path, childModelId);

        if (parentModel) {
          await this._insert(childModelId, data, [parentModel.storeId]);
        } else {
          await this._insert(childModelId, data, []);
        }
        continue;
      }
      if (structureType === 'object' || structureType === 'template') {
        for (let key in data) {
          let pathKey = key;
          if (Array.isArray(data[key])) {
            pathKey = `[]${key}`;
          }
          fields.push([[...path, pathKey], data[key]]);
        }
        if (isEmptyObject(data)) {
          template.push([path, {}]);
        }
        continue;
      }
      if (structureType === 'array') {
        for (let i = 0; i < data.length; i++) {
          let key = i.toString();
          if (Array.isArray(data[i])) {
            key = `[]${key}`;
          }
          fields.push([[...path, key], data[key]]);
        }
        if (data.length === 0) {
          template.push([path, []]);
        }
        continue;
      }
    }

    return {refs, template};
  }
  async _parse(data, {parentModel, omitNextTemplate = false} = {}) {
    const fields = [[[], data]];
    const template = [[[], Array.isArray(data) ? [] : {}]];
    const refs = new Map();

    for (let i = 0; i < fields.length; i++) {
      if (i === 1) {
        omitNextTemplate = false;
      }
      const field = fields[i];

      const path = field[0];
      const data = field[1];

      const structureType = this._getStructureType(data);

      if (structureType === 'unknown') {
        template.push([path, data]);
        continue;
      }
      if (structureType === 'template' && omitNextTemplate === false) {
        const childModelId = this._getId(data);

        refs.set(path, childModelId);

        if (parentModel) {
          await this._insert(childModelId, data, [parentModel.storeId]);
        } else {
          await this._insert(childModelId, data, []);
        }
        continue;
      }
      if (structureType === 'object' || structureType === 'template') {
        for (let key in data) {
          let pathKey = key;
          if (Array.isArray(data[key])) {
            pathKey = `[]${key}`;
          }
          fields.push([[...path, pathKey], data[key]]);
        }
        if (isEmptyObject(data)) {
          template.push([path, {}]);
        }
        continue;
      }
      if (structureType === 'array') {
        for (let i = 0; i < data.length; i++) {
          let key = i.toString();
          if (Array.isArray(data[i])) {
            key = `[]${key}`;
          }
          fields.push([[...path, key], data[key]]);
        }
        if (data.length === 0) {
          template.push([path, []]);
        }
        continue;
      }
    }

    return {refs, template};
  }
}

export {Iresine};
export default Iresine;
