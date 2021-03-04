import {isObject} from '@iresine/helpers';

function set(target, path, value) {
  if (path === '' || (Array.isArray(path) && path.length === 0)) {
    return;
  }
  path = Array.isArray(path) ? path : path.split('.');
  let entity = target;
  for (let i = 0; i < path.length; i++) {
    let currentPath = path[i];

    currentPath =
      typeof currentPath === 'number' ? currentPath.toString() : currentPath;
    const isArrPath = currentPath.startsWith('[]');

    let key;
    if (isArrPath) {
      key = currentPath.slice(2);
    } else {
      key = currentPath;
    }
    // const key = isArrPath ? currentPath.slice(2) : currentPath;

    // if (i === path.length - 1) {
    //   entity[key] = value;
    //   break;
    // }

    if (i === path.length - 1) {
      entity[key] = value;
      break;
    }

    const targetValue = entity[key];

    if (isArrPath) {
      if (!Array.isArray(targetValue)) {
        entity[key] = [];
      }
      entity = entity[key];
    } else {
      if (!isObject(targetValue)) {
        entity[key] = {};
      }
      entity = entity[key];
    }

    // if (isMapPath) {
    //   if (!(targetValue instanceof Map)) {
    //     setSingle(entity, key, new Map());
    //   }
    //   entity = getSingle(entity, key);
    // } else if (isSetPath) {
    //   if (!(targetValue instanceof Set)) {
    //     setSingle(entity, key, new Set());
    //   }
    //   entity = getSingle(entity, key);
    // } else if (isArrPath) {
    //   if (!Array.isArray(targetValue)) {
    //     setSingle(entity, key, []);
    //   }
    //   entity = getSingle(entity, key);
    // } else {
    //   if (!isObject(targetValue)) {
    //     setSingle(entity, key, {});
    //   }
    //   entity = getSingle(entity, key);
    // }

    // if (isArrPath && !entity[key]) {
    //   entity[key] = [];
    // } else if (!entity[key]) {
    //   entity[key] = {};
    // }

    // entity = entity[key];
  }
  return target;

  function setSingle(target, key, value) {
    if (target instanceof Map) {
      target.set(key, value);
    } else if (target instanceof Set) {
      target.add(value);
    } else if (Array.isArray(target)) {
      target[key] = value;
    } else {
      target[key] = value;
    }
  }

  function getSingle(target, key) {
    if (target instanceof Map) {
      return target.get(key);
    } else if (target instanceof Set) {
      return target.get(value);
    } else if (Array.isArray(target)) {
      return target[key];
    } else {
      return target[key];
    }
  }
}

function joinTemplate(template) {
  const rootStructure = Array.isArray(template[0][1]) ? [] : {};
  for (let i = 1; i < template.length; i++) {
    const [path, value] = template[i];

    if (Array.isArray(value)) {
      set(rootStructure, path, []);
    } else if (isObject(value)) {
      set(rootStructure, path, {});
    } else {
      set(rootStructure, path, value);
    }
  }

  return rootStructure;
}

export default {
  set,
  joinTemplate,
};
