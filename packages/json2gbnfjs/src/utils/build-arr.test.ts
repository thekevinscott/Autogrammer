import { vi } from 'vitest';
import { buildArr } from './build-arr.js';

// import { build } from './build.js';
import type * as _build from './utils/build.js';

vi.mock('./utils/build.js', async () => {
  const actual = await vi.importActual('./utils/build.js') as typeof _build;
  return {
    ...actual,
    build: vi.fn().mockImplementation((...args: any[]) => args.join(' ')),
  };
});

describe('buildArr', () => {
  it('should return a string when n is 0', () => {
    const result = buildArr(0, 'test');
    expect(result).toEqual('');
  });

  it('should return a string with the specified content repeated n times', () => {
    const result = buildArr(3, 'test');
    expect(result).toEqual('test test test');
  });

  it('should return an empty string when content is an empty string', () => {
    const result = buildArr(5, '');
    expect(result).toEqual('');
  });

  it('should return a string with the same object reference for each element', () => {
    const content = 'value';
    const result = buildArr(3, content);
    expect(result).toEqual(`value value value`);
  });

  it('should throw an error when n is negative', () => {
    expect(() => buildArr(-1, 'test')).toThrow('n must be a non-negative integer');
  });

  it('should throw an error when n is not an integer', () => {
    expect(() => buildArr(3.14, 'test')).toThrow('n must be a non-negative integer');
  });
});
