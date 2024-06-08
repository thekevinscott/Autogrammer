import {
  vi,
  describe,
  expect,
  test,
  afterEach,
} from 'vitest';
import {
  BLANK_GRAMMAR,
  JSON2GBNF,
  ROOT_ID
} from "./json2gbnf.js";
import { Grammar } from "./grammar.js";
import type * as _Grammar from './grammar.js';
import { hasDollarSchemaProp } from './type-guards.js';
import type * as _types from './types.js';
import { VALUE_KEY } from './constants/grammar-keys.js';
import { parse } from './utils/parse.js';
import type * as _parse from './utils/parse.js';
import {
  GLOBAL_CONSTANTS
} from './constants/constants.js';

vi.mock('./utils/parse.js', async () => {
  const actual = await vi.importActual('./utils/parse.js') as typeof _parse;
  return {
    ...actual,
    parse: vi.fn(),
  };
});

vi.mock('./grammar.js', async () => {
  const actual = await vi.importActual('./grammar.js') as typeof _Grammar;
  return {
    ...actual,
    Grammar: vi.fn(),
  };
});

vi.mock('./type-guards.js', async () => {
  const actual = await vi.importActual('./type-guards.js') as typeof _types;
  return {
    ...actual,
    hasDollarSchemaProp: vi.fn().mockReturnValue(false),
  };
});

describe('JSON2GBNF', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  // test('it returns blank grammar if passed false', () => {
  //   expect(JSON2GBNF(false)).toEqual(BLANK_GRAMMAR);
  // });

  test('it throws an error if schema is an object with an unsupported schema version', () => {
    vi.mocked(hasDollarSchemaProp).mockReturnValue(true);
    const schema = 'https://json-schema.org/draft/2020-11/schema';
    expect(() => JSON2GBNF({
      $schema: schema,
    })).toThrow(`Unsupported schema version: ${schema}`);
  });


  test.each([
    true,
    null,
    undefined,
  ])('it adds root rule if passed %s', (arg) => {
    const addRule = vi.fn();
    vi.mocked(Grammar).mockImplementation(() => {
      class MockGrammar {
        addRule = addRule;
        grammar = ['foo'];
      }
      return new MockGrammar() as any as Grammar;
    });

    expect(JSON2GBNF(arg)).toEqual([`root ::= ${ROOT_ID}`, 'foo', ...GLOBAL_CONSTANTS].join('\n'));
    expect(addRule).toHaveBeenCalledWith(VALUE_KEY, ROOT_ID);
  });

  test('it adds root rule if passed an empty object', () => {
    const addRule = vi.fn();
    vi.mocked(Grammar).mockImplementation(() => {
      class MockGrammar {
        addRule = addRule;
        grammar = ['foo'];
      }
      return new MockGrammar() as any as Grammar;
    });

    expect(JSON2GBNF({})).toEqual([`root ::= ${ROOT_ID}`, 'foo', ...GLOBAL_CONSTANTS].join('\n'));
    expect(addRule).toHaveBeenCalledWith(VALUE_KEY, ROOT_ID);
  });

  test('it returns a string if schema is an object', () => {
    class MockGrammar {
      grammar = ['foo'];
      addRule = vi.fn();
      getConst = vi.fn();
      opts = {};
    }

    const mockGrammar = new MockGrammar() as any as Grammar;
    vi.mocked(Grammar).mockImplementation(() => {
      return mockGrammar;
    });

    const schema = {
      type: 'string',
    };

    expect(JSON2GBNF(schema)).toEqual([`root ::= ${ROOT_ID}`, 'foo', ...GLOBAL_CONSTANTS].join('\n'));

    expect(parse).toHaveBeenCalledWith(mockGrammar, schema, ROOT_ID);
  });

});
