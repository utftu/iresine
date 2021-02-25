import Store from './index.js';
import {jest} from '@jest/globals';

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

describe('core', () => {
  describe('.join()', () => {
    it('join single template ', () => {
      const store = new Store();

      store.parse(oldUser);
      expect(store.join('user:0')).toEqual(oldUser);
    });
  });
  describe('.parse()', () => {
    it('parse single template', () => {
      const store = new Store();

      store.parse(oldUser);
      expect(store.join('user:0')).toEqual(oldUser);
    });
    it('multi', () => {
      const store = new Store();
      const multi = {
        object: {
          0: oldUser,
        },
        array: [oldComment],
      };

      store.parse(multi);
      expect(store.join('user:0')).toEqual(multi.object['0']);
      expect(store.join('comment:0')).toEqual(multi.array['0']);
    });
  });
  describe('update', () => {
    it('update single template', () => {
      const store = new Store();

      store.parse(oldUser);
      store.parse(newUser);
      expect(store.join('user:0')).toEqual(newUser);
    });
    it('update multi templates', () => {
      const store = new Store();
      const multi = {
        object: {
          0: oldUser,
        },
        array: {
          0: oldComment,
        },
      };
      const multi1 = {
        object: {
          0: newUser,
        },
        array: {
          0: newComment,
        },
      };

      store.parse(multi);
      store.parse(multi1);
      expect(store.join('user:0')).toEqual(multi1.object['0']);
      expect(store.join('comment:0')).toEqual(multi1.array['0']);
    });
  });
  describe('.get()', () => {
    it('single', () => {
      const store = new Store();

      store.parse(oldUser);
      const userResult = store.get('user:0');
      const userResult1 = store.get('user:0');
      expect(userResult).toBe(userResult1);
    });
  });
  describe('.template', () => {
    it('object', () => {
      const store = new Store();
      const data = {
        count: 0,
        object: {
          count: 1,
        },
        array: [
          {
            count: 2,
          },
        ],
      };

      const {template} = store.parse(data);
      expect(template[0][0]).toEqual([]);
      expect(template[0][1]).toEqual({});
      expect(template[1][0]).toEqual(['count']);
      expect(template[1][1]).toEqual(0);
      expect(template[2][0]).toEqual(['object', 'count']);
      expect(template[2][1]).toEqual(1);
      expect(template[3][0]).toEqual(['[]array', '0', 'count']);
      expect(template[3][1]).toEqual(2);
    });
    it('array', () => {
      const store = new Store();

      const data = [
        {
          count: 0,
        },
      ];

      const {template} = store.parse(data);
      expect(template[0][0]).toEqual([]);
      expect(template[0][1]).toEqual([]);
      expect(template[1][0]).toEqual(['0', 'count']);
      expect(template[1][1]).toEqual(0);
    });
  });
  describe('.refs', () => {
    it('single', () => {
      const store = new Store();

      const {refs} = store.parse(oldUser);
      expect(refs).toEqual(new Map([[[], 'user:0']]));
    });
    it('multi', () => {
      const store = new Store();
      const multi = {
        object: {
          0: oldUser,
        },
        array: [oldComment],
      };

      const {refs} = store.parse(multi);
      expect(refs).toEqual(
        new Map([
          [['object', '0'], 'user:0'],
          [['[]array', '0'], 'comment:0'],
        ])
      );
    });
  });
  describe('.subscribe()', () => {
    it('subscribe to single template', () => {
      const store = new Store();

      const {refs} = store.parse(oldUser);
      const modelIds = [...refs.values()];

      const callback = jest.fn();
      store.subscribe(modelIds, callback);
      expect(callback.mock.calls.length).toBe(0);
      store.parse(oldComment);
      expect(callback.mock.calls.length).toBe(0);
      store.parse(newUser);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0].length).toBe(1);
      expect(callback.mock.calls[0][0]).toEqual(['user:0']);
      store.parse(newComment);
      expect(callback.mock.calls.length).toBe(1);
    });
    it('subscribe to multi templates', () => {
      const store = new Store();

      const callback = jest.fn();
      const {refs} = store.parse([oldUser, oldComment]);
      store.subscribe([...refs.values()], callback);
      store.parse([newUser, newComment]);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0].length).toBe(1);
      expect(callback.mock.calls[0][0].length).toBe(2);
      expect(callback.mock.calls[0][0].includes('user:0')).toBe(true);
      expect(callback.mock.calls[0][0].includes('comment:0')).toBe(true);
    });
  });
  describe('.unsubscribe()', () => {
    it('single', () => {
      const store = new Store();

      const {refs} = store.parse(oldUser);
      const modelIds = [...refs.values()];
      const callback = jest.fn();
      store.subscribe(modelIds, callback);
      store.unsubscribe(modelIds, callback);
      store.parse(newUser);
      expect(callback.mock.calls.length).toBe(0);
    });
  });
  describe('recursive', () => {
    it('two', () => {
      const store = new Store();

      const user0 = {
        id: '0',
        type: 'user',
        name: '0',
      };

      const user1 = {
        id: '1',
        type: 'user',
        name: '1',
      };

      user0.friend = user1;
      user1.friend = user0;

      store.parse(user0);
      expect(store.get('user:0')).toBe(user0);
      expect(store.join('user:0')).toEqual(user0);
    });
    it('three', () => {
      const store = new Store();

      const user0 = {
        id: '0',
        type: 'user',
        name: '0',
      };

      const user1 = {
        id: '1',
        type: 'user',
        name: '1',
      };

      const user2 = {
        id: '2',
        type: 'user',
        name: '2',
      };

      user0.love = user1;
      user1.love = user2;
      user2.love = user0;

      store.parse(user0);
      expect(store.get('user:0')).toBe(user0);
      expect(store.join('user:0')).toEqual(user0);
    });
  });
  describe('.joinRefs()', () => {
    it('model', () => {
      const store = new Store();

      const {refs, template} = store.parse(oldUser);
      const recreate = store.joinRefs(template, refs);
      expect(recreate).toBe(oldUser);
    });
    it('structure', () => {
      const store = new Store();

      const data = {
        count: 0,
        object: {
          count: 1,
          user: oldUser,
        },
        array: [
          oldComment,
          {
            count: 2,
          },
        ],
      };

      const {refs, template} = store.parse(data);
      const recreate = store.joinRefs(template, refs);
      expect(recreate).toEqual(data);
    });
  });
});
