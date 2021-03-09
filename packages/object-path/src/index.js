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
  }
  return target;
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

export {set, joinTemplate};

export default {
  set,
  joinTemplate,
};
