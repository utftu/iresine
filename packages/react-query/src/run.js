import IresineReactQuery from './index.js';
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

const store = new Store();
const queryClient = new QueryClient();
// new ReactQueryWrapper(store, queryClient);

queryClient.getQueryCache().subscribe((queryEvent) => {
  if (queryEvent.type !== 'queryUpdated') {
    return;
  }
  queryClient.getQueryCache().queriesMap['["oldRequest"]'].state.data = {
    name: 'hehe',
  };
  console.log(
    queryClient.getQueryCache().queries.map((query) => query.state.data)
  );
});

queryClient.getQueryCache().subscribe((queryEvent) => {
  console.log(
    queryClient.getQueryCache().queries.map((query) => query.state.data)
  );
  // console.log('-----', 'queryEvent 2', queryEvent.query.state.data);
});

queryClient.setQueryData('oldRequest', oldRequest);
queryClient.setQueryData('oldRequest', newRequest);
console.log(
  queryClient.getQueryCache().queries.map((query) => query.state.data)
);

// console.log(
//   '-----',
//   'queryClient.getQueryCache()',
//   queryClient.getQueryCache().queriesMap['["oldRequest"]'].state.data
// );

// setQueryDataNotCopy(queryClient, 'oldRequest', oldRequest);
// setQueryDataNotCopy(queryClient, 'newRequest', newRequest);
//
// const oldRequestData = queryClient.getQueryData('oldRequest');

// .console.log(oldRequestData.users[0]);
// console.log(oldRequestData.users[0] === newUser);
// console.log(oldRequestData.comments[0] === newComment);
