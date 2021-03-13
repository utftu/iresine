import {isObject, setAdd} from '@iresine/helpers';
import {set} from '@iresine/object-path';

console.log('-----', 'object', isObject);
console.log('-----', 'set', set);
console.log('-----', 'setADD', setAdd);

// import {Iresine} from './index.js';
//
// const oldUser = {
//   id: '0',
//   type: 'user',
//   name: 'oldName',
// };
// const oldComment = {
//   id: '0',
//   type: 'comment',
//   text: 'oldText',
// };
//
// const store = new Iresine();
//
// const data = {
//   count: 0,
//   object: {
//     count: 1,
//     user: oldUser,
//   },
//   array: [
//     oldComment,
//     {
//       count: 2,
//     },
//   ],
// };
//
// const {refs, template} = store.parse(data);
// const recreate = store.joinRefs(template, refs);
