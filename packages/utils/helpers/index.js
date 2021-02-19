export function isEmptyObject(obj) {
  for (const key in obj) {
    return false;
  }
  return true;
}

export function isObject(data) {
  const prototype = Object.getPrototypeOf(data);
  return !!(prototype === Object.prototype || prototype === null);
}
