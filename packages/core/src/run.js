import {Iresine} from './index.js';
import expect from 'expect';

const iresine = new Iresine();
const child = {
  id: '0',
  type: 'child',
};

const oldParent = {
  id: '0',
  type: 'parent',
  child,
};

const newParent = {
  id: '0',
  type: 'parent',
};

iresine.parse(oldParent);
iresine.parse(newParent);
console.log(iresine.models.get('child:0').parents);
