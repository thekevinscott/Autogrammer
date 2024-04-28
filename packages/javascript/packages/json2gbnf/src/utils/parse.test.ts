// parse.test.ts
import { describe, it, expect, vi, } from 'vitest';
import { parse, } from './parse.js';
import { NULL_KEY, } from '../constants/grammar-keys.js';
import { JSONSchema, } from '../types.js';
import {
  parseType,
} from './parse-type.js';
import type * as _parseType from './parse-type.js';
import { Grammar } from '../grammar.js';

vi.mock('./parse-type.js', async () => {
  const actual = await vi.importActual('./parse-type.js') as typeof _parseType;
  return {
    ...actual,
    parseType: vi.fn((schema: any) => 'parsedType'),
  };
});

describe('parse', () => {
  let parser: Grammar;

  beforeEach(() => {
    parser = {
      addRule: vi.fn((rule: string) => rule),
      getConst: vi.fn((key: string) => key),
      opts: {},
    } as unknown as Grammar;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should parse enum schema', () => {
    const schema: JSONSchema = {
      enum: ['foo', 'bar', null,],
    };
    parse(parser, schema, 'enumSymbol');
    expect(parser.addRule).toHaveBeenCalledWith(`"\\"foo\\"" | "\\"bar\\"" | ${NULL_KEY}`, 'enumSymbol');
  });

  it('should parse schema with array of types', () => {
    const schema: JSONSchema = {
      type: ['string', 'number',],
    };
    parse(parser, schema, 'arrayTypeSymbol');
    expect(parser.addRule).toHaveBeenCalledWith('str | num', 'arrayTypeSymbol');
  });

  it('should parse schema with a single type', () => {
    const schema: JSONSchema = {
      type: 'string',
    };
    vi.mocked(parseType).mockImplementationOnce(() => 'parsedString');
    parse(parser, schema, 'singleTypeSymbol');
    expect(parser.addRule).toHaveBeenCalledWith('parsedString', 'singleTypeSymbol');
    expect(parseType).toHaveBeenCalledWith(parser, schema);
  });

  it('should throw an error for unknown types', () => {
    const schema = {
      type: ['unknown'],
    };
    expect(() => {
      parse(parser, schema as JSONSchema, 'unknownTypeSymbol');
    }).toThrow('Unknown type unknown for schema {"type":["unknown"]}');
  });

  it('should parse schema with fixed order option', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        foo: { type: 'string', },
        bar: { type: 'number', },
      },
    };
    parser.fixedOrder = true;
    vi.mocked(parseType).mockImplementationOnce(() => 'parsedObject');
    parse(parser, schema, 'fixedOrderSymbol');
    expect(parser.addRule).toHaveBeenCalledWith('parsedObject', 'fixedOrderSymbol');
    expect(parseType).toHaveBeenCalledWith(parser, schema);
  });
});
