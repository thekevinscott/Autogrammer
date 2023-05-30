import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest';
import { getConstKey } from './get-const-key.js';
import { WHITESPACE_KEY } from '../constants/grammar-keys.js';

describe('getConstKey', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  })
  it('should return the key with left and right whitespace', () => {
    const key = 'CONST_KEY';
    const left = true;
    const right = true;

    const result = getConstKey(key, left, right);
    expect(result).toBe(`${WHITESPACE_KEY}CONST_KEY${WHITESPACE_KEY}`);
  });

  it('should return the key with only left whitespace', () => {
    const key = 'CONST_KEY';
    const left = true;
    const right = false;

    const result = getConstKey(key, left, right);
    expect(result).toBe(`${WHITESPACE_KEY}CONST_KEY`);
  });

  it('should return the key with only right whitespace', () => {
    const key = 'CONST_KEY';
    const left = false;
    const right = true;

    const result = getConstKey(key, left, right);
    expect(result).toBe(`CONST_KEY${WHITESPACE_KEY}`);
  });

  it('should return the key without any whitespace', () => {
    const key = 'CONST_KEY';
    const left = false;
    const right = false;

    const result = getConstKey(key, left, right);
    expect(result).toBe('CONST_KEY');
  });

  it('should handle an empty key', () => {
    const key = '';
    const left = true;
    const right = true;

    const result = getConstKey(key, left, right);
    expect(result).toBe(`${WHITESPACE_KEY}${WHITESPACE_KEY}`);
  });

  it('should handle a key with whitespace characters', () => {
    const key = 'CONST KEY';
    const left = true;
    const right = true;

    const result = getConstKey(key, left, right);
    expect(result).toBe(`${WHITESPACE_KEY}CONST KEY${WHITESPACE_KEY}`);
  });
});
