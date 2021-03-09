import {Iresine} from '@iresine/core';
import {IresineReactQuery} from './index.js';
import React from 'react';
import reactQuery from 'react-query';
import * as testingLibraryReact from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {setQueryDataNotCopy} from './helpers/index.js';

//
const {render} = testingLibraryReact.default;
const {QueryClient, QueryClientProvider, useQuery} = reactQuery;

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

describe('react-query wrapper', () => {
  describe('react', () => {
    it('1', async () => {
      const iresine = new Iresine();
      const queryClient = new QueryClient();
      new IresineReactQuery(iresine, queryClient);
      let updates1 = 0;
      let updates2 = 0;

      function Component1() {
        const {data} = useQuery('oldRequest', () => oldUser);
        updates1++;
        return <div>{data?.name}</div>;
      }

      function Component2() {
        const {data} = useQuery(
          'newRequest',
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(newUser));
            })
        );
        updates2++;
        return <div>{data?.name}</div>;
      }

      render(
        <QueryClientProvider client={queryClient}>
          <Component1 />
          <Component2 />
        </QueryClientProvider>
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(updates1).toBe(3);
      expect(updates2).toBe(2);
      console.log('-----', 'updates1', updates1);
      console.log('-----', 'updates2', updates2);
    });
  });
  describe('replace', () => {
    it('single', () => {
      const store = new Iresine();
      const queryClient = new QueryClient();
      new IresineReactQuery(store, queryClient);

      setQueryDataNotCopy(queryClient, 'user:0', oldUser);
      setQueryDataNotCopy(queryClient, 'users', [newUser]);

      expect(queryClient.getQueryData('users')[0]).toBe(newUser);
      expect(queryClient.getQueryData('user:0')).toBe(newUser);
    });
    it('multi', () => {
      const store = new Iresine();
      const queryClient = new QueryClient();
      new IresineReactQuery(store, queryClient);

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

      setQueryDataNotCopy(queryClient, 'oldRequest', oldRequest);
      setQueryDataNotCopy(queryClient, 'newRequest', newRequest);

      const oldRequestData = queryClient.getQueryData('oldRequest');

      expect(oldRequestData.users[0]).toBe(newUser);
      expect(oldRequestData.comments[0]).toBe(newComment);
    });
  });
  it('unknown', () => {
    const iresine = new Iresine();
    const queryClient = new QueryClient();
    new IresineReactQuery(iresine, queryClient);

    setQueryDataNotCopy(queryClient, 'null', null);
    setQueryDataNotCopy(queryClient, 'undefined', undefined);
    setQueryDataNotCopy(queryClient, 42, 42);
    setQueryDataNotCopy(queryClient, 'string', 'string');
    setQueryDataNotCopy(queryClient, false, false);
  });
});
