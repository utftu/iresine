export function isEmptyObject(obj) {
  for (const key in obj) {
    return false;
  }
  return true;
}

export function isObject(data) {
  if (data === null || data === undefined) {
    return false;
  }
  const prototype = Object.getPrototypeOf(data);
  return prototype === Object.prototype || prototype === null;
}

export function setAdd(set, iterator) {
  for (const el of iterator) {
    set.add(el);
  }
}

export function isPrimitive(data) {
  if (data === undefined || data === null) {
    return true;
  }
  if (Array.isArray(data)) {
    return false;
  }
  if (isObject(data)) {
    return false;
  }
  return true;
}

export default {
  isObject,
  isPrimitive,
  isEmptyObject,
};
