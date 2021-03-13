import op from './index.js';
import expect from 'expect';

describe('object path', () => {
  describe('set', () => {
    it('multi', () => {
      const obj = {};

      op.set(obj, '1', '1');
      op.set(obj, '[]2', '2');
      op.set(obj, '3.3', '3');
      op.set(obj, '[]4.0', '4');
      expect(obj[1]).toBe('1');
      expect(obj[2]).toBe('2');
      expect(obj[3][3]).toBe('3');
      expect(Array.isArray(obj['4'])).toBe(true);
      expect(obj[4][0]).toBe('4');
    });
    it('not recreate object', () => {
      const user = {
        friend: {
          name: 'alex',
        },
      };
      const oldOld = user.friend;

      op.set(user, 'friend.number', '8800');
      expect(user.friend).toBe(oldOld);
      expect(user.friend.number).toBe('8800');
    });
    it('not recreate array', () => {
      const user = {
        friends: [{name: 'alex'}],
      };
      const oldFriends = user.friends;
      const oldFiend = user.friends[0];
      const newFriend = {name: 'sasha'};

      op.set(user, '[]friends.1', newFriend);
      expect(user.friends).toBe(oldFriends);
      expect(user.friends[0]).toBe(oldFiend);
      expect(user.friends[1].name).toBe('sasha');
    });
  });
});
