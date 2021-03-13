import {Iresine} from './index.js';
import expect from 'expect';
import mock from 'jest-mock';

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

describe('core', () => {
  describe('.join()', () => {
    it('join single template ', () => {
      const store = new Iresine();

      store.parse(oldUser);
      expect(store.join('user:0')).toEqual(oldUser);
    });
  });
  describe('.parse()', () => {
    it('parse single template', () => {
      const store = new Iresine();

      store.parse(oldUser);
      expect(store.join('user:0')).toEqual(oldUser);
    });
    it('multi', () => {
      const store = new Iresine();
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
      const store = new Iresine();

      store.parse(oldUser);
      store.parse(newUser);
      expect(store.join('user:0')).toEqual(newUser);
    });
    it('update multi templates', () => {
      const store = new Iresine();
      const oldRequest = {
        users: [oldUser],
        comments: {
          0: oldComment,
        },
      };
      const newRequest = {
        users: {
          0: newUser,
        },
        comments: [newComment],
      };

      store.parse(oldRequest);
      store.parse(newRequest);
      expect(store.join('user:0')).toEqual(newRequest.users['0']);
      expect(store.join('comment:0')).toEqual(newRequest.comments['0']);
    });
  });
  describe('.get()', () => {
    it('single', () => {
      const store = new Iresine();

      store.parse(oldUser);
      const userResult = store.get('user:0');
      const userResult1 = store.get('user:0');
      expect(userResult).toBe(userResult1);
    });
  });
  describe('.template', () => {
    it('object', () => {
      const store = new Iresine();
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
      const store = new Iresine();

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
      const store = new Iresine();

      const {refs} = store.parse(oldUser);
      expect(refs).toEqual(new Map([[[], 'user:0']]));
    });
    it('multi', () => {
      const store = new Iresine();
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
      const store = new Iresine();

      const {refs} = store.parse(oldUser);
      const modelIds = [...refs.values()];

      const callback = mock.fn();
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
      const store = new Iresine();

      const callback = mock.fn();
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
      const store = new Iresine();

      const {refs} = store.parse(oldUser);
      const modelIds = [...refs.values()];
      const callback = mock.fn();
      store.subscribe(modelIds, callback);
      store.unsubscribe(modelIds, callback);
      store.parse(newUser);
      expect(callback.mock.calls.length).toBe(0);
    });
  });
  describe('recursive', () => {
    it('two', () => {
      const store = new Iresine();

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
      const store = new Iresine();

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
      const store = new Iresine();

      const {refs, template} = store.parse(oldUser);
      const recreate = store.joinRefs(template, refs);
      expect(recreate).toBe(oldUser);
    });
    it('structure', () => {
      const store = new Iresine();

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
  describe('time', () => {
    it('add', () => {
      const iresine = new Iresine({
        time: {timeField: '_time', uniqField: 'uniq'},
      });
      const user = {
        id: '0',
        type: 'user',
        name: 'oldUser',
      };
      iresine.parse(user);
    });
  });
  describe('structures', () => {
    it('boolean', () => {
      const iresine = new Iresine();

      const result = iresine.parse(true);
      expect(result).toBe(null);
    });
    it('number', () => {
      const iresine = new Iresine();

      const result = iresine.parse(42);
      expect(result).toBe(null);
    });
    it('string', () => {
      const iresine = new Iresine();

      const result = iresine.parse('hello');
      expect(result).toBe(null);
    });
    it('null', () => {
      const iresine = new Iresine();

      const result = iresine.parse(null);
      expect(result).toBe(null);
    });
    it('undefined', () => {
      const iresine = new Iresine();

      const result = iresine.parse(null);
      expect(result).toBe(null);
    });
    it('map', () => {
      const iresine = new Iresine();

      const result = iresine.parse(new Map());
      expect(result).toBe(null);
    });
    it('set', () => {
      const iresine = new Iresine();

      const result = iresine.parse(new Set());
      expect(result).toBe(null);
    });
    it('map in deep', () => {
      const iresine = new Iresine();

      const data = {
        map: new Map([[1, 1]]),
      };

      const {template} = iresine.parse(data);
      expect(template).toEqual([
        [[], {}],
        [['map'], data.map],
      ]);
    });
  });
});
