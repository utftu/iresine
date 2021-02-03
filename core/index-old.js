import {setAdd, setRightUniq} from './utils.js';

class Model {
  constructor(type, id, template) {
    this.type = type;
    this.id = id;
    this.template = template;
  }
  parents = new Set();
  children = new Set();
  refs = new Map();

  on = new Set();
  get storeId() {
    return `${this.type}:${this.id}`;
  }
  get modelId() {
    return `${this.type}:${this.id}`;
  }
}

class Store {
  models = new Map();

  reconciliation(storedId) {
    // todo parent lay
    const parents = new Set(this.models.get(storedId).parents.values());
    const updates = new Set();

    for (const modelId of parents) {
      const model = this.models.get(modelId);
      if (model.parents.size === 0) {
        updates.add(modelId);
        continue;
      }

      for (const parentModelId of model.parents.values()) {
        parents.add(parentModelId);
      }
    }

    for (const modelId of updates) {
      const model = this.models.get(modelId);
      if (model.children.size) {
        for (const childrenModelId of model.children) {
          updates.add(childrenModelId);
        }
      }
    }
  }

  on(storedIds, listener) {
    for (const storeId of storedIds) {
      this.models.get(storeId).on.add(listener);
    }
  }
  parse(data) {
    return this.#parse(data);
  }
  #checkModel(storeId) {
    const idsToCheck = new Set([storeId]);
    for (const storeId of idsToCheck) {
      const model = this.models.get(storeId);
      if (model.on.size !== 0) {
        continue;
      }
      if (model.children.size !== 0) {
        setAdd(idsToCheck, model.children);
      }

      this.models.delete(storeId);
    }
  }
  #insertModel(storeId, template, parentModelIds) {
    if (this.models.has(storeId) && this.models.get(storeId).template === template) {
      if (parentModelIds) {
        setAdd(this.models.get(storeId).parents, parentModelIds);
      }
      return;
    }

    if (!this.models.has(storeId)) {
      this.models.set(storeId, new Model(getTemplateType(template), getTemplateId(template), template));
    }

    const currentModel = this.models.get(storeId);

    const oldChildren = currentModel.children;
    currentModel.children = new Set();
    currentModel.template = template;

    currentModel.refs = this.#parse(template, {
      currentModel: currentModel,
      omitNextTemplate: true,
    });

    for (const removedChildId of setRightUniq(currentModel.children, oldChildren)) {
      this.#checkModel(removedChildId);
    }

    // todo
    if (parentModelIds) {
      setAdd(currentModel.parents, parentModelIds);
    }
  }
  #parse(data, {currentModel, omitNextTemplate = false} = {}) {
    const fields = [['', data]];
    const refs = new Map();

    for (let i = 0; i < fields.length; i++) {
      if (i === 1) {
        omitNextTemplate = false;
      }
      const field = fields[i];

      const path = field[0];
      const data = field[1];

      const structureType = getStructureType(data);

      if (structureType === 'primitive') {
        continue;
      }
      if (structureType === 'template' && omitNextTemplate === false) {
        const childModelId = getStoreKey(data);

        refs.set(path, childModelId);

        if (currentModel) {
          currentModel.children.add(childModelId);
          this.#insertModel(childModelId, data, [currentModel.storeId]);
        } else {
          this.#insertModel(childModelId, data, []);
        }
        continue;
      }
      if (structureType === 'object' || structureType === 'template') {
        for (const key in data) {
          fields.push([`${mayDot(path)}${key}`, data[key]]);
        }
        continue;
      }
      if (structureType === 'array') {
        for (let i = 0; i < data.length; i++) {
          fields.push([`${mayDot(path)}${i}`, data[i]]);
        }
        continue;
      }
    }

    return refs;
  }
}

function getStructureType(data) {
  if (Array.isArray(data)) {
    return 'array';
  }
  if (isTemplate(data)) {
    return 'template';
  }
  if (isObject(data)) {
    return 'object';
  }
  return 'primitive';
}

function mayDot(str) {
  return str.length === 0 ? str : `${str}.`;
}

function getStoreKey(template) {
  return `${getTemplateType(template)}:${getTemplateId(template)}`;
}

function getTemplateType(template) {
  return template.__typename;
}

function getTemplateId(template) {
  return template.id;
}

function isTemplate(data) {
  return !!(getTemplateType(data) && getTemplateId(data));
}

function isObject(data) {
  const prototype = Object.getPrototypeOf(data);
  return !!(prototype === Object.prototype || prototype === null);
}

function isArray(data) {
  return Array.isArray(data);
}

// const user = {
//   __typename: 'user',
//   id: '1',
//   bestFriends: [
//     {
//       __typename: 'user',
//       id: '2',
//     },
//     {
//       __typename: 'user',
//       id: '3',
//     },
//   ],
//   enemy: {
//     __typename: 'user',
//     id: '4',
//   },
// };

const user = {
  id: '1',
  name: 'alex',
  __typename: 'user',
  bestFriend: {
    __typename: 'user',
    id: '3',
  },
  friends: {
    1111: {
      id: '2',
      __typename: 'user',
      name: 'sasha',
    },
  },
  comments: [
    {
      id: '1',
      text: 'hi',
      __typename: 'comment',
      articles: {
        __typename: 'article',
        id: '1',
        name: 'this is trump',
      },
    },
    {
      id: '2',
      text: 'bye',
      __typename: 'comment',
    },
  ],
};

const newUser1 = {
  __typename: 'user',
  id: '1',
  name: 'alex svincraft',
  friends: {
    1111: {
      id: '2',
      __typename: 'user',
      name: 'sasha',
    },
  },
};

const newUser2 = {
  id: '2',
  __typename: 'user',
  name: 'sasha bulochka',
};

// const store = new Store();
// // console.time('1');
// const a = store.parse(user);
// // store.parse(newUser1);
// store.parse(newUser2);
// // console.timeEnd('1');
// console.log('-----', 'store.models', store.models);

export default Store;
