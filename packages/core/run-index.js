import Store from './index.js';

const store = new Store();
const oldUser = {
  id: '0',
  __typename: 'user',
  name: 'oldName',
};
const newUser = {
  id: '0',
  __typename: 'user',
  name: 'newName',
};

const refs = store.parse(oldUser);
const modelIds = [...refs.values()];

store.subscribe(modelIds, (ids) => console.log('-----', 'is listener', ids));

store.parse(newUser);
store.parse(oldUser);
store.parse({
  id: '4',
  __typename: 'user',
  name: '124',
});
// store.parse(newUser);

// console.log('-----', 'modelIds', modelIds);
