import {
  describe,
  it,
  expect,
} from 'vitest';
import { buildGrammar } from './build-grammar.js';

import type * as _constants from '../constants/constants.js';
import { vi } from 'vitest';

vi.mock('../constants/constants.js', async () => {
  const actual = await vi.importActual('../constants/constants.js') as typeof _constants;
  return {
    ...actual,
    GLOBAL_CONSTANTS: ['CONSTANT1', 'CONSTANT2'],
  };
});

describe('buildGrammar', () => {
  it('should build the grammar correctly', () => {
    const entries = new Map([
      ['rule1', 'key1'],
      ['rule2', 'key2'],
      ['rule3', 'key3'],
    ]).entries();

    const expected = [
      `key1 ::= rule1`,
      `key2 ::= rule2`,
      `key3 ::= rule3`,
      `CONSTANT1`,
      `CONSTANT2`,
    ];

    expect([...buildGrammar(entries, true)]).toStrictEqual(expected);
  });

  it('should handle an empty entries iterator', () => {
    const entries = new Map().entries();

    const expected = [
      `CONSTANT1`,
      `CONSTANT2`,
    ];

    expect([...buildGrammar(entries, true)]).toStrictEqual(expected);
  });

  it('should throw an error when a key is an empty string', () => {
    const entries = new Map([
      ['rule1', ''],
    ]).entries();

    expect(() => [...buildGrammar(entries, true)]).toThrowError('Key cannot be an empty string');
  });

  it('should throw an error when a rule is an empty string', () => {
    const entries = new Map([
      ['', 'key1'],
    ]).entries();

    expect(() => [...buildGrammar(entries, true)]).toThrowError('Rule cannot be an empty string');
  });

  it('should handle entries with special characters', () => {
    const entries = new Map([
      ['rule1 | rule2', 'key1'],
      ['rule3 & rule4', 'key2'],
      ['rule5 ::= rule6', 'key3'],
    ]).entries();

    const expected = [
      `key1 ::= rule1 | rule2`,
      `key2 ::= rule3 & rule4`,
      `key3 ::= rule5 ::= rule6`,
      `CONSTANT1`,
      `CONSTANT2`,
    ];

    expect([...buildGrammar(entries, true)]).toStrictEqual(expected);
  });
});
