import {setAdd} from './utils'

class Model {
  constructor(type, id, template) {
    this.type = type
    this.id = id
    this.template = template
  }
  parents = new Set()
  children = new Set()

  on = new Set()
  get storeId() {
    return `${this.type}:${this.id}`
  }
  get modelId() {
    return `${this.type}:${this.id}`
  }

}

class Store {
  models = new Map()

  reconciliation(storedId) {
    const parents = new Set(this.models.get(storedId).parents.values())
    const updates = new Set()

    for (const modelId of parents) {
      const model = this.models.get(modelId)
      if (model.parents.size === 0) {
        updates.add(modelId)
        continue
      }

      for (const parentModelId of model.parents.values()) {
        parents.add(parentModelId)
      }
    }

    for (const modelId of updates) {
      const model = this.models.get(modelId)
      if (model.children.size) {
        for (const childrenModelId of model.children) {
          updates.add(childrenModelId)
        }
      }
    }
  }

  on(storedIds, listener) {
    for (const storeId of storedIds) {
      this.models.get(storeId).on.add(listener)
    }
  }

  updateModel(storeId, model) {

  }

  parse(data) {
    const storeIds = []
    this.#parse(data, {storeIds})
    return storeIds
  }
  #insertModel(template, parentModel) {
    const storeId = getStoreKey(template)
    if (!this.models.has(storeId)) {
      this.models.set(storeId, new Model(template.__typename, template.id, template))
    }
    const currentModel = this.models.get(storeId)
    currentModel.template = this.#parse(template, {currentModel, omitNextModel: true})
    if (parentModel) {
      currentModel.parents.add(parentModel.storeId)
    }
    return Symbol.for(storeId)
  }
  #insertModelOut(storeId, template, parentModelIds) {
    // const storeId = getStoreKey(template)
    if (!this.models.has(storeId)) {
      this.models.set(storeId, new Model(template.__typename, template.id, template))
    }
    const currentModel = this.models.get(storeId)
    currentModel.template = this.#parse(
      template,
      {currentModelId: currentModel.modelId, omitNextModel: true}
    )
    if (parentModelIds) {
      setAdd(currentModel.parents, parentModelIds)
    }
    return Symbol.for(storeId)
  }
  #parse(data, {currentModel, omitNextModel, storeIds}) {
    if (isObject(data)) {
      if (isModelTemplate(data) && !omitNextModel) {
        const sym = this.#insertModel(data, currentModel)
        const storeId = Symbol.keyFor(sym)
        if (currentModel) {
          currentModel.children.add(storeId)
        }
        if (storeIds) {
          storeIds.push(storeId)
        }
        return sym
      }

      const newObject = {}
      for (const key in data) {
        newObject[key] = this.#parse(data[key], {storeIds, currentModel})
      }
      return newObject
    } else if (isArray(data)) {
      const newArr = []
      for (let i = 0; i < data.length; i++) {
        newArr.push(this.#parse(data[i], {storeIds, currentModel}))
      }
      return newArr
    }
    return data
  }
}

function getStoreKey(template) {
  return `${template.__typename}:${template.id}`
}

function isModelTemplate(data) {
  return !!(data.__typename && data.id);
}

function isObject(data) {
  const prototype = Object.getPrototypeOf(data)
  return !!(prototype === Object.prototype || prototype === null);
}

function isArray(data) {
  return Array.isArray(data)
}

const user = {
  id: '1',
  name: 'alex',
  __typename: 'user',
  bestFriend: {
    __typename: 'user',
    id: '3'
  },
  friends: {
    '1111': {
      id: '2',
      __typename: 'user',
      name: 'sasha'
    }
  },
  comments: [
    {
      id: '1',
      text: 'hi',
      __typename: 'comment',
      articles: {
        __typename: 'article',
        id: '1',
        name: 'this is trump'
      }
    },
    {
      id: '2',
      text: 'bye',
      __typename: 'comment'
    }
  ]
}

const store = new Store()
const a = store.parse(user)
console.log('-----', 'a', a)
console.log('-----', 'store.models', store.models)