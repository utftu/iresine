import crypto from 'crypto';

function createHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

const str =
  'wedewdewdwe weh weh wehd wehi ewb ewbfbfwe bwebi ewbi ewi fewhe wew few hewh weh fwf ebwhbf whif ewi fiewf ebiwib fwbihef  we ew ewkbfew bhewf bhf ewfwe bhklefw bkhwe bkweb fewfkh ';
const str1 =
  'wedewdewdwe weh weh wehd wehi ewb ewbfbfwe bwebi ewbi ewi fewhe wew few hewh weh fwf ebwhbf whif ewi fiewf ebiwib fwbihef  we ew ewkbfew bhewf bhf ewfwe bhklefw bkhwe bkweb fewfkh ';

function testHash() {
  const hash = createHash(str);
  const results = [];

  for (let i = 0; i < 1_000; i++) {
    const result = hash === createHash(str);
    results.push(result);
  }

  return results;
}

function testStr() {
  const results = [];

  for (let i = 0; i < 1_000; i++) {
    const result = str === str1;
    results.push(result);
  }

  return results;
}

function bench() {
  let hashTime = 0;
  let strTime = 0;
  for (let i = 0; i < 1000; i++) {
    const startHash = Date.now();
    testHash();
    hashTime += Date.now() - startHash;

    const startStr = Date.now();
    testStr();
    strTime += Date.now() - startStr;
  }
  console.log('-----', 'hashTime', hashTime);
  console.log('-----', 'strTime', strTime);
}

bench();
