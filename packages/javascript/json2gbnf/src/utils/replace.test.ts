import { ARRAY_KEY } from '../constants/grammar-keys.js';
import { replace, } from './replace.js';

describe('grammar-definitions', () => {
  test('it throws if not given a string', () => {
    expect(() => replace(null)).toThrow();
  });

  test('it renders if given a string', () => {
    expect(replace('foo {{ARRAY_KEY}} bar')).toEqual(`foo ${ARRAY_KEY} bar`);
  });
});
