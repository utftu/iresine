import Iresine from './index-async.js';
import mock from 'jest-mock';
import expect from 'expect';

const oldUser = {
  id: '0',
  type: 'user',
  name: 'oldName',
};
const oldComment = {
  id: '0',
  type: 'comment',
  text: 'oldText',
};
const newUser = {
  id: '0',
  type: 'user',
  name: 'newName',
};
const newComment = {
  id: '0',
  type: 'comment',
  text: 'newText',
};

function onTick(callback, controls) {
  if (controls.stop) {
    return;
  }
  setImmediate(() => {
    callback();
    onTick(callback, controls);
  });
}

const iresine = new Iresine({
  maxRequests: 1,
});
let count = 0;

await iresine.parse(oldUser);
console.log('-----', '', iresine.models);
iresine.subscribe(['user:0'], () => count++);
// iresine.parse(oldUser);
// iresine
expect(count).toBe(0);
