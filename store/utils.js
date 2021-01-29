export function setAdd(set, iterator) {
  for (const el of iterator) {
    set.add(el)
  }
}

export function setRightDifference(leftSet, rightSet) {
  const difference = []
  for (const rightEl of rightSet) {
    if (leftSet.has(rightEl)) {
      continue
    }
    difference.push(rightEl)
  }
  return difference
}