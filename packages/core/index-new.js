import {setAdd} from './utils.js';
import objectPath from '@iresine/utils/object-path';
import {isObject, isEmptyObject} from '@iresine/utils/helpers';

class Model {
  constructor(storeId) {
    this.storeId = storeId;
  }
  parents = new Set();
  children = new Set();
  refs = new Map();
  prepared = null;

  listeners = new Set();
}

class Store {
  constructor({getModelId = (template) => template.id, getModelType = (template) => template.__typename} = {}) {
    this.#getModelId = getModelId;
    this.#getModelType = getModelType;
  }

  #getModelId = (template) => template.id;
  #getModelType = (template) => template.__typename;
  #isTemplate(data) {
    return !!(this.#getModelId(data) && this.#getModelType(data));
  }
  #getStoreKey(template) {
    return `${this.#getModelType(template)}:${this.#getModelId(template)}`;
  }
  #getStructureType(data) {
    if (Array.isArray(data)) {
      return 'array';
    }
    if (this.#isTemplate(data)) {
      return 'template';
    }
    if (isObject(data)) {
      return 'object';
    }
    return 'primitive';
  }

  models = new Map();
  updated = new Set();

  parse(data) {
    const refs = this._parse(data);
    const parents = this._reconciliation(this.updated.values());
    this._notify([this.updated, ...parents]);
    this.updated.clear();
    return refs;
  }
  get(storeId) {
    const model = this.models.get(storeId);
    if (model.prepared) {
      return model.prepared;
    }
    // insert in model prepared
    this.join(storeId);
    return model.prepared;
  }
  join(storeId) {
    const model = this.models.get(storeId);
    const templateObj = objectPath.joinTemplate(model.template);
    model.prepared = templateObj;

    for (let [path, storeId] of model.refs) {
      const templateObjChild = this.get(this.models.get(storeId).storeId);
      objectPath.set(path, templateObj, templateObjChild);
    }

    return templateObj;
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
  _reconciliation(storedIds) {
    const parents = new Set();
    for (const storeId of storedIds) {
      parents.add(storeId);
    }

    for (const modelId of parents) {
      const model = this.models.get(modelId);

      for (const parentModelId of model.parents.values()) {
        parents.add(parentModelId);
      }

      model.prepared = null;
    }

    for (const modelId of parents) {
      this.join(modelId);
    }

    return parents;
  }
  _insert(storeId, rawTemplate, parentModelIds) {
    if (this.updated.has(storeId)) {
      return;
    }

    let model = this.models.get(storeId);

    if (!model) {
      this.models.set(storeId, new Model(storeId));
      model = this.models.get(storeId);
    } else {
      model.children.clear();
      this.updated.add(storeId);
    }
    model.prepared = rawTemplate;

    model.refs = this._parse(rawTemplate, {
      currentModel: model,
      omitNextTemplate: true,
    });

    if (parentModelIds) {
      setAdd(model.parents, parentModelIds);
    }
  }
  _parse(data, {currentModel, omitNextTemplate = false} = {}) {
    const fields = [[[], data]];
    const template = [[[], {}]];
    const refs = new Map();

    for (let i = 0; i < fields.length; i++) {
      if (i === 1) {
        omitNextTemplate = false;
      }
      const field = fields[i];

      const path = field[0];
      const data = field[1];

      const structureType = this.#getStructureType(data);

      if (structureType === 'primitive') {
        template.push([path, data]);
        continue;
      }
      if (structureType === 'template' && omitNextTemplate === false) {
        const childModelId = this.#getStoreKey(data);

        refs.set(path, childModelId);

        if (currentModel) {
          currentModel.children.add(childModelId);
          this._insert(childModelId, data, [currentModel.storeId]);
        } else {
          this._insert(childModelId, data, []);
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
        if (data.length === 0) {
          template.push([path, []]);
        }
        for (let i = 0; i < data.length; i++) {
          let key = i.toString();
          if (Array.isArray(data[i])) {
            key = `[]${key}`;
          }
          fields.push([[...path, key], data[key]]);
        }
        continue;
      }
    }

    if (currentModel) {
      currentModel.template = template;
    }

    return refs;
  }
}

export default Store;
