import { vi, } from 'vitest';
import { JSON2GBNF } from "./json2gbnf";
import { SchemaParser } from "./schema-parser.js";
import type * as _SchemaParser from './schema-parser.js';
import { isSchemaObject } from './types.js';
import type * as _types from './types.js';
import { VALUE_KEY } from './constants/grammar-keys.js';
import { parse } from './utils/parse.js';
import type * as _parse from './utils/parse.js';

vi.mock('./utils/parse.js', async () => {
  const actual = await vi.importActual('./utils/parse.js') as typeof _parse;
  return {
    ...actual,
    parse: vi.fn(),
  };
});

vi.mock('./schema-parser.js', async () => {
  const actual = await vi.importActual('./schema-parser.js') as typeof _SchemaParser;
  return {
    ...actual,
    SchemaParser: vi.fn(),
  };
});

vi.mock('./types.js', async () => {
  const actual = await vi.importActual('./types.js') as typeof _types;
  return {
    ...actual,
    isSchemaObject: vi.fn(),
  };
});

describe('JSON2GBNF', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('it throws an error if schema is null', () => {
    expect(() => JSON2GBNF(null)).toThrow('Bad schema provided');
  });

  test('it throws an error if schema is undefined', () => {
    expect(() => JSON2GBNF(undefined)).toThrow('Bad schema provided');
  });

  test('it throws if given "false"', () => {
    expect(() => JSON2GBNF(false)).toThrow('Not implemented yet');
  });

  test('it throws an error if schema is an object with an unsupported schema version', () => {
    vi.mocked(isSchemaObject).mockReturnValue(true);
    const schema = 'https://json-schema.org/draft/2020-11/schema';
    expect(() => JSON2GBNF({
      $schema: schema,
    })).toThrow(`Unsupported schema version: ${schema}`);
  });

  test('it adds root rule if passed true', () => {
    const addRule = vi.fn();
    vi.mocked(SchemaParser).mockImplementation(() => {
      class MockSchemaParser {
        addRule = addRule;
        grammar = 'foo';
      }
      return new MockSchemaParser() as any as SchemaParser;
    });

    expect(JSON2GBNF(true)).toEqual('foo');
    expect(addRule).toHaveBeenCalledWith(VALUE_KEY, 'root');
  });

  test('it adds root rule if passed an empty object', () => {
    const addRule = vi.fn();
    vi.mocked(SchemaParser).mockImplementation(() => {
      class MockSchemaParser {
        addRule = addRule;
        grammar = 'foo';
      }
      return new MockSchemaParser() as any as SchemaParser;
    });

    expect(JSON2GBNF({})).toEqual('foo');
    expect(addRule).toHaveBeenCalledWith(VALUE_KEY, 'root');
  });

  test('it returns a string if schema is an object', () => {
    class MockSchemaParser {
      grammar = 'foo';
      addRule = vi.fn();
      getConst = vi.fn();
      opts = {};
    }

    const mockParser = new MockSchemaParser() as any as SchemaParser;
    vi.mocked(SchemaParser).mockImplementation(() => {
      return mockParser;
    });

    const schema = {
      type: 'string',
    };

    expect(JSON2GBNF(schema)).toEqual('foo');

    expect(parse).toHaveBeenCalledWith(mockParser, schema, 'root');
  });

});
