import fs from 'fs';

const file = fs.readFileSync('./benchmark/hash-benchmark.js');

// console.log('-----', 'file', file.toString())

import('data:text/javascript;charset=utf-8,' + file.toString());

// eval(file.toString())
