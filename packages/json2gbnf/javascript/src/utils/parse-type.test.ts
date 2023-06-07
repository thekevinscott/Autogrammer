import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  test,
} from 'vitest';
import { parseType, } from './parse-type.js';
import {
  ARRAY_KEY,
  BOOLEAN_KEY,
  INTEGER_KEY,
  NULL_KEY,
  NUMBER_KEY,
  OBJECT_KEY,
  STRING_KEY,
} from '../constants/grammar-keys.js';
import {
  type Grammar,
} from '../grammar.js';
import {
  type ParseTypeArg,
} from '../types.js';
import GBNF from 'gbnf';

const getmockGrammar = () => {
  class MockGrammar {
    rules = 'foo';
    addRule = vi.fn();
    getConst = vi.fn();
    opts = {};
  }

  return new MockGrammar() as any as Grammar;
};

describe('parseType', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should throw an error if unsupported keys are present for number/integer type', () => {
    const mockGrammar = getmockGrammar();
    const schema = { type: 'number', exclusiveMinimum: 0, };
    expect(() => parseType(mockGrammar, schema as ParseTypeArg)).toThrowError('exclusiveMinimum is not supported');
  });

  test.each([
    [{ type: 'string' }, 'foo'],
    [{ type: 'number' }, 123.123],
    [{ type: 'integer' }, 123.0],
    [{ type: 'boolean' }, true],
    [{ type: 'boolean' }, false],
    [{ type: 'null' }, null],
    [{ type: 'array' }, []],
    [{ type: 'array' }, [1, 2, 3]],
    [{ type: 'object' }, {}],
  ])(`it should parse '%s' for '%s'`, (schema, initial) => {
    const mockGrammar = getmockGrammar();
    const rule = parseType(mockGrammar, schema as ParseTypeArg);
    expect(() => GBNF([
      rule.compile(),
      `value ::= [0-9]`,
      `obj ::= "{}"`,
    ].join('\n'), JSON.stringify(initial))).not.toThrow();
  });
});
