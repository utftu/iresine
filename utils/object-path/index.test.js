import op from './index.js';

describe('object path', () => {
  describe('set', () => {
    it('1', () => {
      const obj = {};

      op.set('1', obj, '1');
      op.set('[]2', obj, '2');
      op.set('3.3', obj, '3');
      op.set('[]4.0', obj, '4');
      expect(obj['1']).toBe('1');
      expect(obj['2']).toBe('2');
      expect(obj['3']['3']).toBe('3');
      expect(obj['4']['0']).toBe('4');
    });
    it('2', () => {
      const obj = {};
      const needToInsert = {id: '0', __typename: 'comment'};
      const path = ['[]comments', 0];
      op.set(path, obj, needToInsert);
      console.log('-----', 'obj', obj);
    });
  });
});
