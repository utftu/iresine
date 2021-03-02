import objectPath from '@iresine/object-path';
import {isObject, isEmptyObject, setAdd} from '@iresine/helpers';

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
  constructor({getId} = {}) {
    if (getId) {
      this._getId = getId;
    }
  }
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
    return 'primitive';
  }

  models = new Map();
  updated = new Set();

  parse(data) {
    const response = this._parse(data);
    const parents = this._reconciliation(this.updated.values());
    this._notify(new Set([...this.updated, ...parents]));
    this.updated.clear();
    return response;
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
      objectPath.set(templateObj, path, templateObjChild);
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
  joinRefs(template, refs) {
    if (refs.size === 1 && [...refs.keys()][0].length === 0) {
      return this.get([...refs.values()][0]);
    }

    const base = objectPath.joinTemplate(template);
    for (const [path, modelId] of refs.entries()) {
      objectPath.set(base, path, this.get(modelId));
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
  _reconciliation(storedIds) {
    const parents = new Set();
    for (const storeId of storedIds) {
      const model = this.models.get(storeId);
      for (const parentId of model.parents) {
        parents.add(parentId);
      }
    }

    for (const modelId of parents) {
      if (this.updated.has(modelId)) {
        continue;
      }
      const model = this.models.get(modelId);

      for (const parentModelId of model.parents.values()) {
        parents.add(parentModelId);
      }

      model.prepared = null;
    }

    for (const modelId of parents) {
      if (this.updated.has(modelId)) {
        continue;
      }
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
    }
    this.updated.add(storeId);
    model.prepared = rawTemplate;

    const {refs, template} = this._parse(rawTemplate, {
      currentModel: model,
      omitNextTemplate: true,
    });
    model.refs = refs;
    model.template = template;

    if (parentModelIds) {
      setAdd(model.parents, parentModelIds);
    }
  }
  _parse(data, {currentModel, omitNextTemplate = false} = {}) {
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

      if (structureType === 'primitive') {
        template.push([path, data]);
        continue;
      }
      if (structureType === 'template' && omitNextTemplate === false) {
        const childModelId = this._getId(data);

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

    return {refs, template};
  }
}

export default Store;
