import { coerceBoolean, coerceArray } from './coercion';

describe('coerceBoolean', () => {
  it('should return a boolean when passing in a boolean', () => {
    expect(coerceBoolean(true)).toBe(true);
    expect(coerceBoolean(false)).toBe(false);
  });

  it('should return a boolean when passing in a string', () => {
    expect(coerceBoolean('true')).toBe(true);
    expect(coerceBoolean('false')).toBe(false);
    expect(coerceBoolean('test')).toBe(true);
  });

  it('should return a boolean when passing in a number', () => {
    expect(coerceBoolean(1)).toBe(true);
    expect(coerceBoolean(0)).toBe(false);
    expect(coerceBoolean(2)).toBe(true);
  });

  it('should return true when passing in any non-string, non-number or non-boolean', () => {
    expect(coerceBoolean({})).toBe(true);
    expect(coerceBoolean([])).toBe(true);
    expect(coerceBoolean(null)).toBe(false);
    expect(coerceBoolean(undefined)).toBe(false);
  });
});

describe('coerceArray', () => {
  it('should convert a non-array value to an array with a single element', () => {
    expect(coerceArray(1)).toEqual([1]);
    expect(coerceArray('test')).toEqual(['test']);
    expect(coerceArray({})).toEqual([{}]);
  });

  it('should pass through an array', () => {
    expect(coerceArray([1])).toEqual([1]);
    expect(coerceArray(['test', 'test2'])).toEqual(['test', 'test2']);
    expect(coerceArray([{}])).toEqual([{}]);
  });
});
