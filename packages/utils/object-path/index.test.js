import op from './index.js';

describe('object path', () => {
  describe('set', () => {
    it('multi', () => {
      const obj = {};

      op.set('1', obj, '1');
      op.set('[]2', obj, '2');
      op.set('3.3', obj, '3');
      op.set('[]4.0', obj, '4');
      expect(obj['1']).toBe('1');
      expect(obj['2']).toBe('2');
      expect(obj['3']['3']).toBe('3');
      expect(Array.isArray(obj['4'])).toBe(true);
      expect(obj['4']['0']).toBe('4');
    });
  });
});
