import Store from './index.js';

describe('core', () => {
  describe('parse', () => {
    it('parse single template', () => {
      const store = new Store();
      const user = {
        id: '1',
        __typename: 'user',
      };

      const refs = store.parse(user);
      expect(store.models.get('user:1').template).toBe(user);
      expect(refs.get('')).toBe('user:1');
    });
    it('parse multi templates', () => {
      const store = new Store();
      const multi = {
        object: {
          0: {
            id: '0',
            __typename: 'user',
          },
        },
        array: [
          {
            id: '1',
            __typename: 'user',
          },
        ],
      };

      const refs = store.parse(multi);
      expect(store.models.get('user:0').template).toBe(multi.object[0]);
      expect(refs.get('object.0')).toBe('user:0');
      expect(store.models.get('user:1').template).toBe(multi.array[0]);
      expect(refs.get('array.0')).toBe('user:1');
    });
  });
  describe('update', () => {
    it('update single template', () => {
      const store = new Store();
      const user = {
        id: '1',
        __typename: 'user',
        name: '1',
      };

      const user1 = {
        id: '1',
        __typename: 'user',
        name: '11',
      };

      store.parse(user);
      store.parse(user1);
      expect(store.models.get('user:1').template).toBe(user1);
    });
    it('update multi templates', () => {
      const store = new Store();
      const multi = {
        object: {
          0: {
            id: '0',
            __typename: 'user',
            name: '0',
          },
        },
        array: {
          0: {
            id: '1',
            __typename: 'user',
            name: '1',
          },
        },
      };
      const multi1 = {
        object: {
          0: {
            id: '0',
            __typename: 'user',
            name: '00',
          },
        },
        array: {
          0: {
            id: '1',
            __typename: 'user',
            name: '11',
          },
        },
      };

      store.parse(multi);
      store.parse(multi1);
      expect(store.models.get('user:0').template).toBe(multi1.object['0']);
      expect(store.models.get('user:1').template).toBe(multi1.array['0']);
    });
  });
});
