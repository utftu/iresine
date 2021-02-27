import {isObject} from '@iresine/helpers';

function set(target, path, value) {
  if (path === '' || (Array.isArray(path) && path.length === 0)) {
    return;
  }
  const pathArr = Array.isArray(path) ? path : path.split('.');
  let entity = target;
  for (let i = 0; i < pathArr.length; i++) {
    const currentPath = pathArr[i];

    const currentPathString =
      typeof currentPath === 'number' ? currentPath.toString() : currentPath;
    const isArrPath = currentPathString.startsWith('[]');
    const key = isArrPath ? currentPath.slice(2) : currentPath;

    if (i === pathArr.length - 1) {
      entity[key] = value;
      break;
    }

    if (isArrPath && !entity[key]) {
      entity[key] = [];
    } else if (!entity[key]) {
      entity[key] = {};
    }

    entity = entity[key];
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

export default {
  set,
  joinTemplate,
};
