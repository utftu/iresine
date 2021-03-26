function isEmptyObject(obj) {
  for (const key in obj) {
    return false;
  }
  return true;
}

function isObject(data) {
  if (data === null || data === undefined) {
    return false;
  }
  const prototype = Object.getPrototypeOf(data);
  return prototype === Object.prototype || prototype === null;
}

function setAdd(set, iterator) {
  for (const el of iterator) {
    set.add(el);
  }
}

function setUniq(set1, set2) {
  const uniq = new Set();
  for (const set1Item of set1) {
    if (set2.has(set1Item)) {
      continue;
    }
    uniq.add(set1Item);
  }
  return uniq;
}

function isPrimitive(data) {
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

export {setAdd, isObject, isPrimitive, isEmptyObject, setUniq};

export default {
  setAdd,
  isObject,
  setUniq,
  isPrimitive,
  isEmptyObject,
};
