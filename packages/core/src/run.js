import {Iresine} from './index.js';

function addUniq(entity) {
  entity._time = Date.now();
  Object.defineProperty(entity, 'uniq', {
    get() {
      return `${entity.type}:${entity.id}:${entity._time}`;
    },
  });
}

const iresine = new Iresine({
  hooks: {
    join: addUniq,
    parse: addUniq,
  },
});

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

iresine.parse(oldUser);
iresine.parse(newUser);

console.log('-----', 'oldUser', oldUser.uniq);
console.log('-----', 'oldUser', newUser.uniq);
console.log('-----', iresine.get('user:0')._time);
iresine.join('user:0');
console.log('-----', iresine.get('user:0')._time);
