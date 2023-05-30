import {
  describe,
  test,
  expect,
} from 'vitest';
import { GrammarParseError } from '../utils/errors.js';
import {
  INVALID_NAME_CHAR,
  PARSE_NAME_ERROR,
  parseName
} from './parse-name.js';

describe('parseName', () => {
  test.each([
    ['validname', 'validname'],
    ['valid-name', 'valid-name',],
    ['validName', 'valid'],
    ['valid_name', 'valid'],
  ])('should return correct position when encountering "%s"', (src, expectation) => {
    const name = parseName(src, 0);
    expect(name).toEqual(expectation);
  });

  test('should return correct position when encountering a valid name starting at a non-zero position', () => {
    const src = '123validname';
    const name = parseName(src, 3);
    expect(name).toEqual('validname');
  });

  test.each([
    ['123', PARSE_NAME_ERROR,],
    ['NNN', PARSE_NAME_ERROR,],
    [':', PARSE_NAME_ERROR,],
    ['_', PARSE_NAME_ERROR,],
    ['-', INVALID_NAME_CHAR('-'),],
  ])('should throw an error for "%s"', (src, error) => {
    expect(() => {
      parseName(src, 0);
    }).toThrow(new GrammarParseError(src, 0, error));
  });
});
