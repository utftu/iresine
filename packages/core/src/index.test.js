import {Iresine} from './index-async.js';
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

function onTick(callback, controls) {
  if (controls.stop) {
    return;
  }
  setImmediate(() => {
    callback();
    onTick(callback, controls);
  });
}

describe('core', () => {
  describe('.join()', () => {
    it('join single template ', async () => {
      const store = new Iresine();

      await store.parse(oldUser);
      expect(await store.join('user:0')).toEqual(oldUser);
    });
  });
  describe('.parse()', () => {
    it('parse single template', async () => {
      const store = new Iresine();

      await store.parse(oldUser);
      expect(await store.join('user:0')).toEqual(oldUser);
    });
    it('multi', async () => {
      const store = new Iresine();
      const multi = {
        object: {
          0: oldUser,
        },
        array: [oldComment],
      };

      await store.parse(multi);
      expect(await store.join('user:0')).toEqual(multi.object['0']);
      expect(await store.join('comment:0')).toEqual(multi.array['0']);
    });
  });
  describe('update', () => {
    it('update single template', async () => {
      const store = new Iresine();

      await store.parse(oldUser);
      await store.parse(newUser);
      expect(await store.join('user:0')).toEqual(newUser);
    });
    it('update multi templates', async () => {
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

      await store.parse(oldRequest);
      await store.parse(newRequest);
      expect(await store.join('user:0')).toEqual(newRequest.users['0']);
      expect(await store.join('comment:0')).toEqual(newRequest.comments['0']);
    });
  });
  describe('.get()', () => {
    it('single', async () => {
      const store = new Iresine();

      await store.parse(oldUser);
      const userResult = await store.get('user:0');
      const userResult1 = await store.get('user:0');
      expect(userResult).toBe(userResult1);
    });
  });
  describe('.template', () => {
    it('object', async () => {
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

      const {template} = await store.parse(data);
      expect(template[0][0]).toEqual([]);
      expect(template[0][1]).toEqual({});
      expect(template[1][0]).toEqual(['count']);
      expect(template[1][1]).toEqual(0);
      expect(template[2][0]).toEqual(['object', 'count']);
      expect(template[2][1]).toEqual(1);
      expect(template[3][0]).toEqual(['[]array', '0', 'count']);
      expect(template[3][1]).toEqual(2);
    });
    it('array', async () => {
      const store = new Iresine();

      const data = [
        {
          count: 0,
        },
      ];

      const {template} = await store.parse(data);
      expect(template[0][0]).toEqual([]);
      expect(template[0][1]).toEqual([]);
      expect(template[1][0]).toEqual(['0', 'count']);
      expect(template[1][1]).toEqual(0);
    });
  });
  describe('.refs', () => {
    it('single', async () => {
      const store = new Iresine();

      const {refs} = await store.parse(oldUser);
      expect(refs).toEqual(new Map([[[], 'user:0']]));
    });
    it('multi', async () => {
      const store = new Iresine();
      const multi = {
        object: {
          0: oldUser,
        },
        array: [oldComment],
      };

      const {refs} = await store.parse(multi);
      expect(refs).toEqual(
        new Map([
          [['object', '0'], 'user:0'],
          [['[]array', '0'], 'comment:0'],
        ])
      );
    });
  });
  describe('.subscribe()', () => {
    it('subscribe to single template', async () => {
      const store = new Iresine();

      const {refs} = await store.parse(oldUser);
      const modelIds = [...refs.values()];

      const callback = mock.fn();
      store.subscribe(modelIds, callback);
      expect(callback.mock.calls.length).toBe(0);
      await store.parse(oldComment);
      expect(callback.mock.calls.length).toBe(0);
      await store.parse(newUser);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0].length).toBe(1);
      expect(callback.mock.calls[0][0]).toEqual(['user:0']);
      await store.parse(newComment);
      expect(callback.mock.calls.length).toBe(1);
    });
    it('subscribe to multi templates', async () => {
      const store = new Iresine();

      const callback = mock.fn();
      const {refs} = await store.parse([oldUser, oldComment]);
      store.subscribe([...refs.values()], callback);
      await store.parse([newUser, newComment]);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0].length).toBe(1);
      expect(callback.mock.calls[0][0].length).toBe(2);
      expect(callback.mock.calls[0][0].includes('user:0')).toBe(true);
      expect(callback.mock.calls[0][0].includes('comment:0')).toBe(true);
    });
  });
  describe('.unsubscribe()', () => {
    it('single', async () => {
      const store = new Iresine();

      const {refs} = await store.parse(oldUser);
      const modelIds = [...refs.values()];
      const callback = mock.fn();
      store.subscribe(modelIds, callback);
      store.unsubscribe(modelIds, callback);
      await store.parse(newUser);
      expect(callback.mock.calls.length).toBe(0);
    });
  });
  describe('recursive', () => {
    it('two', async () => {
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

      await store.parse(user0);
      expect(await store.get('user:0')).toBe(user0);
      expect(await store.join('user:0')).toEqual(user0);
    });
    it('three', async () => {
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

      await store.parse(user0);
      expect(await store.get('user:0')).toBe(user0);
      expect(await store.join('user:0')).toEqual(user0);
    });
  });
  describe('.joinRefs()', () => {
    it('model', async () => {
      const store = new Iresine();

      const {refs, template} = await store.parse(oldUser);
      const recreate = await store.joinRefs(template, refs);
      expect(recreate).toBe(oldUser);
    });
    it('structure', async () => {
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

      const {refs, template} = await store.parse(data);
      const recreate = await store.joinRefs(template, refs);
      expect(recreate).toEqual(data);
    });
  });
  describe('add uniq', () => {
    function addUniq(entity) {
      Object.defineProperty(entity, '_time', {
        value: Date.now(),
      });
      Object.defineProperty(entity, 'uniq', {
        get() {
          return `${entity.type}:${entity.id}:${entity._time}`;
        },
      });
    }
    // it('parse', () => {
    //   const iresine = new Iresine({
    //     hooks: {
    //       parse: addUniq,
    //     },
    //   });
    //   const user = {
    //     id: '0',
    //     type: 'user',
    //     name: 'oldUser',
    //   };
    //   iresine.parse(user);
    //
    //   expect(iresine.get('user:0').uniq).toBe(user.uniq);
    // });
    it('join', async () => {
      const iresine = new Iresine({
        hooks: {
          join: addUniq,
        },
      });
      const user = {
        id: '0',
        type: 'user',
        name: 'oldUser',
      };
      await iresine.parse(user);

      expect((await iresine.join('user:0')).uniq.startsWith('user:0:')).toBe(
        true
      );
    });
  });
  describe('structures', () => {
    it('boolean', async () => {
      const iresine = new Iresine();

      const result = await iresine.parse(true);
      expect(result).toBe(null);
    });
    it('number', async () => {
      const iresine = new Iresine();

      const result = await iresine.parse(42);
      expect(result).toBe(null);
    });
    it('string', async () => {
      const iresine = new Iresine();

      const result = await iresine.parse('hello');
      expect(result).toBe(null);
    });
    it('null', async () => {
      const iresine = new Iresine();

      const result = await iresine.parse(null);
      expect(result).toBe(null);
    });
    it('undefined', async () => {
      const iresine = new Iresine();

      const result = await iresine.parse(null);
      expect(result).toBe(null);
    });
    it('map', async () => {
      const iresine = new Iresine();

      const result = await iresine.parse(new Map());
      expect(result).toBe(null);
    });
    it('set', async () => {
      const iresine = new Iresine();

      const result = await iresine.parse(new Set());
      expect(result).toBe(null);
    });
    it('map in deep', async () => {
      const iresine = new Iresine();

      const data = {
        map: new Map([[1, 1]]),
      };

      const {template} = await iresine.parse(data);
      expect(template).toEqual([
        [[], {}],
        [['map'], data.map],
      ]);
    });
  });
  describe('remove old parents', () => {
    it('single', async () => {
      const iresine = new Iresine();
      const child = {
        id: '0',
        type: 'child',
      };

      const oldParent = {
        id: '0',
        type: 'parent',
        child,
      };

      const newParent = {
        id: '0',
        type: 'parent',
      };
      await iresine.parse(oldParent);
      expect((await iresine.models.get('child:0')).parents).toEqual(
        new Set(['parent:0'])
      );
      await iresine.parse(newParent);
      expect((await iresine.models.get('child:0')).parents).toEqual(new Set());
    });
  });
  describe('async', () => {
    it('simple', async () => {
      const iresine = new Iresine();
      let countTick = 0;
      const controls = {};
      onTick(() => (countTick = countTick + 1), controls);

      await iresine.parse(oldUser);
      controls.stop = true;
      expect(countTick).toBe(0);
    });
    it('3 entities tick', async () => {
      const iresine = new Iresine({
        maxEntities: 1,
      });

      let countTick = 0;
      const controls = {};
      onTick(() => (countTick = countTick + 1), controls);

      await iresine.parse([oldUser, oldComment, {id: '0', type: 'any'}]);
      controls.stop = true;
      expect(countTick).toBe(2);
    });
    it('1 process tick', async () => {
      let countRequests = 0;
      let countTicks = 0;
      const controls = {};
      onTick(() => (countTicks = countTicks + 1), controls);
      const iresine = new Iresine({
        maxRequests: 2,
      });

      await iresine.parse(oldUser);
      iresine.subscribe(['user:0'], () => countRequests++);
      const promise1 = iresine.parse(oldUser);
      const promise2 = iresine.parse(oldUser);
      await Promise.all([promise1, promise2]);
      controls.stop = true;
      expect(countRequests).toBe(1);
      expect(countTicks).toBe(0);
    });
    it('2 process tick', async () => {
      let countRequests = 0;
      let countTicks = 0;
      const controls = {};
      onTick(() => (countTicks = countTicks + 1), controls);

      const iresine = new Iresine({
        maxRequests: 1,
      });

      await iresine.parse(oldUser);
      iresine.subscribe(['user:0'], () => countRequests++);
      const promise1 = iresine.parse(oldUser);
      const promise2 = iresine.parse(oldUser);
      await Promise.all([promise1, promise2]);
      controls.stop = true;
      expect(countRequests).toBe(2);
      expect(countTicks).toBe(1);
    });
  });
});
