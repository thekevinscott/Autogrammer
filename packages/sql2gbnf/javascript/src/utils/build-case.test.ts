import {
  describe,
  test,
  expect,
} from 'vitest';
import { buildCase } from './build-case.js';

describe('buildCase', () => {
  test('it builds a case with any', () => {
    expect(buildCase('any', 'foo', 'bar')).toEqual(`(([fF] [oO] [oO]) | ([bB] [aA] [rR]))`);
  });

  test('it builds a case with lower', () => {
    expect(buildCase('lower', 'foo', 'bar')).toEqual(`(("f" "o" "o") | ("b" "a" "r"))`);
  });
  test('it builds a case with upper', () => {
    expect(buildCase('upper', 'foo', 'bar')).toEqual(`(("F" "O" "O") | ("B" "A" "R"))`);
  });
});
