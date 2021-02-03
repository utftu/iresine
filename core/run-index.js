import Store from './index.js';

const store = new Store();

const user = {
  id: '0',
  __typename: 'user',
  name: 'alex',
  obj: {},
  arr: [],
  comments: [
    {
      id: '0',
      __typename: 'comment',
    },
    {
      id: '1',
      __typename: 'comment',
    },
  ],
};

store.parse(user);
console
  .log
  // '-----',
  // 'store.models',
  // store.models
  // [...store.models.values()].map((model) => JSON.stringify(model))
  ();

console.log('-----', "store.join('user:0'))", store.join('user:0'));
