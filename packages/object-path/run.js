import op from './src/index.js';

const obj = {};

// op.set(obj, '1', '1');
// op.set(obj, '[]2', '2');
// op.set(obj, '3.3', '3');
// op.set(obj, '[]4.0', '4');
// op.set(obj, ['set[]abc', '1'], 'value1');
// op.set(obj, ['set[]abc', '0'], 'value0');
op.set(obj, ['map{}8', '7'], 8);

console.log('-----', 'obj', obj);
