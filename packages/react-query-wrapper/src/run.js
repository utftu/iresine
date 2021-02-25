import ReactQueryWrapper from './index.js';
import {QueryClient} from 'react-query';
import Store from '@iresine/core';
import {setQueryDataNotCopy} from './helpers/index.js';

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
  text: 'newComment',
};

const store = new Store();
const queryClient = new QueryClient();
new ReactQueryWrapper(store, queryClient);

const oldRequest = {
  users: [oldUser],
  comments: {
    0: oldComment,
  },
};

const newRequest = {
  newUsers: {
    0: newUser,
  },
  newComments: [newComment],
};

// queryClient.setQueryData('oldRequest', oldRequest);
// queryClient.setQueryData('newRequest', newRequest);
setQueryDataNotCopy(queryClient, 'oldRequest', oldRequest);
setQueryDataNotCopy(queryClient, 'newRequest', newRequest);

const oldRequestData = queryClient.getQueryData('oldRequest');

console.log(oldRequestData.users[0]);
console.log(oldRequestData.users[0] === newUser);
console.log(oldRequestData.comments[0] === newComment);
