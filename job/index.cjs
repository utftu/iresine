function firstLetterLow(str) {
  return `${str[0].toLowerCase()}${str.slice(1)}`;
}

function prepare(geoNodes) {
  const store = new Map();

  function parse(geoNode, child) {
    const type = firstLetterLow(geoNode.type);
    const storeId = `${type}:${geoNode.id}`;

    if (!store.has(storeId)) {
      store.set(storeId, {
        value: geoNode.id,
        label: geoNode.title,
        disable: !geoNode.isVisible,
        children: [],
      });
    }

    if (child) {
      const childType = firstLetterLow(child.type);
      const childStoreId = `${childType}:${child.id}`;
      const model = store.get(storeId)
      if (!model.children.includes(childStoreId)) {
        model.children.push(childStoreId);
      }
    }

    if (geoNode.parent) {
      parse(geoNode.parent, geoNode);
    }
  }

  geoNodes.forEach((geoNode) => parse(geoNode));

  function join(node) {
    if (node.children.length === 0) {
      return node;
    }

    return {
      ...node,
      children: node.children.map((childId) => join(store.get(childId))),
    };
  }

  return [...store.keys()]
    .filter((storeId) => storeId.startsWith('country'))
    .map((storeId) => join(store.get(storeId)));
}

const geoNodes = require('./data.json').data.catalogue.geoList.items;

require('fs').writeFileSync(__dirname + '/result.json', JSON.stringify(prepare(geoNodes), null, 2))