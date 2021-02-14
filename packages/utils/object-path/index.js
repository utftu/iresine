function set(path, target, value) {
  if (path === '' || (Array.isArray(path) && path.length === 0)) {
    return;
  }
  const pathArr = Array.isArray(path) ? path : path.split('.');
  let entity = target;
  for (let i = 0; i < pathArr.length; i++) {
    const currentPath = pathArr[i];

    const currentPathString = typeof currentPath === 'number' ? currentPath.toString() : currentPath;
    const isArrPath = currentPathString.startsWith('[]');
    const key = isArrPath ? currentPath.slice(2) : currentPath;

    if (i === pathArr.length - 1) {
      entity[key] = value;
      break;
    }

    if (isArrPath) {
      entity[key] = [];
    } else if (!entity[key]) {
      entity[key] = {};
    }

    entity = entity[key];
  }
  return target;
}

function parse(data, {currentModel, omitNextTemplate = false} = {}) {
  const fields = [[[], data]];
  const template = [];
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

export default {
  set,
};
