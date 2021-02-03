function set(path, target, value) {
  const pathArr = Array.isArray(path) ? path : path.split('.');
  let entity = target;
  for (let i = 0; i < pathArr.length; i++) {
    const currentPath = pathArr[i];

    const isArrPath = currentPath.slice(0, 2) === '[]';
    const key = isArrPath ? currentPath.slice(2) : currentPath;

    if (i === pathArr.length - 1) {
      entity[key] = value;
      break;
    }

    if (isArrPath && !Array.isArray(entity[key])) {
      entity[key] = [];
    } else if (!entity[key]) {
      entity[key] = {};
    }

    entity = entity[key];
  }
  return target;
}

export default {
  set,
};

const obj = {};
set('', obj, 'hello');
console.log('-----', 'obj', obj);
