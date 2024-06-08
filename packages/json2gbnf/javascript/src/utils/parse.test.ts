import {
  describe,
  test,
  expect,
  vi,
  afterEach,
} from 'vitest';
import { parse, } from './parse.js';
import { JSONSchema, } from '../types.js';
import {
  parseType,
} from './parse-type.js';
import type * as _parseType from './parse-type.js';
import {
  isSchemaConst,
  isSchemaEnum,
  isSchemaMultipleBasicTypes,
} from '../type-guards.js';
import type * as _typeGuards from '../type-guards.js';
import {
  parseEnum,
} from './parse-enum.js';
import type * as _parseEnum from './parse-enum.js';
import {
  getConstDefinition,
} from './get-const-definition.js';
import type * as _getConstDefinition from './get-const-definition.js';
import {
  Grammar
} from '../grammar.js';
import {
  array,
  boolean,
  nll,
  number,
  object,
  string
} from '../constants.js';
import {
  _,
} from 'gbnf/builder-v2';

vi.mock('../type-guards.js', async () => {
  const actual = await vi.importActual('../type-guards.js') as typeof _typeGuards;
  return {
    ...actual,
    isSchemaConst: vi.fn(),
    isSchemaEnum: vi.fn(),
    isSchemaMultipleBasicTypes: vi.fn(),
  };
});

vi.mock('./parse-type.js', async () => {
  const actual = await vi.importActual('./parse-type.js') as typeof _parseType;
  return {
    ...actual,
    parseType: vi.fn((schema: any) => 'parsedType'),
  };
});

vi.mock('./parse-enum.js', async () => {
  const actual = await vi.importActual('./parse-enum.js') as typeof _parseEnum;
  return {
    ...actual,
    parseEnum: vi.fn(),
  };
});

vi.mock('./get-const-definition.js', async () => {
  const actual = await vi.importActual('./get-const-definition.js') as typeof _getConstDefinition;
  return {
    ...actual,
    getConstDefinition: vi.fn(),
  };
});

describe('parse fn', () => {
  let parser: Grammar;

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Multiple Primitives', () => {
    test('should parse schema with a handful of primitives', () => {
      vi.mocked(isSchemaMultipleBasicTypes).mockReturnValueOnce(true);
      const schema: JSONSchema = {
        type: ['string', 'number',],
      };
      const rule = parse(parser, schema);
      expect(rule.compile()).toEqual(_`${[string, number]}`.separate(' | ').compile());
    });

    test('should parse schema with all primitives', () => {
      vi.mocked(isSchemaMultipleBasicTypes).mockReturnValueOnce(true);
      const schema: JSONSchema = {
        type: ['string', 'number', 'boolean', 'null', 'object', 'array',],
      };
      const rule = parse(parser, schema);
      expect(rule.compile()).toEqual(_`${[string, number, boolean, nll, object, array]}`.separate(' | ').compile());
    });
  })

  test('should parse enum schema', () => {
    vi.mocked(isSchemaEnum).mockReturnValueOnce(true);
    const schema: JSONSchema = {
      enum: ['foo', 'bar', null,],
    };
    parse(parser, schema);
    expect(parseEnum).toHaveBeenCalledWith(schema);
  });

  test('should parse const schema', () => {
    vi.mocked(isSchemaConst).mockReturnValueOnce(true);
    const schema: JSONSchema = {
      const: 'foo',
    };
    parse(parser, schema);
    expect(getConstDefinition).toHaveBeenCalledWith(schema);
  });

  test('should parse type', () => {
    const schema: JSONSchema = {
      const: 'foo',
    };
    parse(parser, schema);
    expect(parseType).toHaveBeenCalledWith(parser, schema);
  });

  test('should throw an error for unknown types', () => {
    vi.mocked(isSchemaMultipleBasicTypes).mockReturnValueOnce(true);
    const schema = {
      type: ['unknown'],
    };
    expect(() => {
      parse(parser, schema as JSONSchema);
    }).toThrowError(new Error('Unknown type unknown for schema {"type":["unknown"]}'));
  });
});
