import { describe, it, expect, vi, } from 'vitest';
import { parseObject, } from './parse-object.js';
import {
  COLON_KEY,
  COMMA_KEY,
  LEFT_BRACE_KEY,
  OBJECT_KEY,
  QUOTE_KEY,
  RIGHT_BRACE_KEY,
} from '../constants/grammar-keys.js';
import { JSONSchemaObject } from '../types.js';

import {
  parseType,
} from './parse-type.js';
import type * as _parseType from './parse-type.js';
import { SchemaParser } from '../schema-parser.js';

vi.mock('./parse-type.js', async () => {
  const actual = await vi.importActual('./parse-type.js') as typeof _parseType;
  return {
    ...actual,
    parseType: vi.fn((schema: any) => 'parsedType'),
  };
});

const getMockParser = (fixedOrder = false) => {
  class MockSchemaParser {
    rules = 'foo';
    addRule = vi.fn().mockImplementation((key: string) => key);
    getConst = vi.fn().mockImplementation((key: string) => key);
    fixedOrder = fixedOrder;
  }

  return new MockSchemaParser() as any as SchemaParser;
};

describe('parseObject', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return OBJECT_KEY if properties is undefined', () => {
    const schema = {} as JSONSchemaObject;
    const mockParser = getMockParser();
    expect(parseObject(mockParser, schema)).toBe(OBJECT_KEY);
    expect(mockParser.addRule).not.toHaveBeenCalled();
    expect(mockParser.getConst).not.toHaveBeenCalled();
    expect(parseType).not.toHaveBeenCalled();
  });

  it('should throw an error if an unsupported key is present', () => {
    const schema = { patternProperties: {}, } as JSONSchemaObject;
    const mockParser = getMockParser();
    expect(() => parseObject(mockParser, schema)).toThrowError(
      'patternProperties is not supported',
    );
  });

  it('should parse object with properties', () => {
    const schema: JSONSchemaObject = {
      type: 'object',
      properties: {
        foo: { type: 'string', },
        bar: { type: 'number', },
      },
    };
    const mockParser = getMockParser();
    const expected = `${LEFT_BRACE_KEY} (${QUOTE_KEY} "foo" ${QUOTE_KEY} ${COLON_KEY} parsedType | ${QUOTE_KEY} "foo" ${QUOTE_KEY} ${COLON_KEY} parsedType ${COMMA_KEY} ${QUOTE_KEY} "bar" ${QUOTE_KEY} ${COLON_KEY} parsedType | ${QUOTE_KEY} "bar" ${QUOTE_KEY} ${COLON_KEY} parsedType | ${QUOTE_KEY} "bar" ${QUOTE_KEY} ${COLON_KEY} parsedType ${COMMA_KEY} ${QUOTE_KEY} "foo" ${QUOTE_KEY} ${COLON_KEY} parsedType)? ${RIGHT_BRACE_KEY}`;
    expect(parseObject(mockParser, schema)).toBe(expected);
    expect(mockParser.addRule).toHaveBeenCalledTimes(4);
    expect(mockParser.getConst).toHaveBeenCalledTimes(4);
    expect(parseType).toHaveBeenCalledTimes(2);
  });

  it('should parse object with enum property', () => {
    const schema: JSONSchemaObject = {
      type: 'object',
      properties: {
        foo: { enum: ['a', 'b'], },
      },
    };
    const mockParser = getMockParser();
    const expected = `${LEFT_BRACE_KEY} (${QUOTE_KEY} "foo" ${QUOTE_KEY} ${COLON_KEY} ${QUOTE_KEY} "a" ${QUOTE_KEY} | ${QUOTE_KEY} "b" ${QUOTE_KEY})? ${RIGHT_BRACE_KEY}`;
    expect(parseObject(mockParser, schema)).toBe(expected);
    expect(mockParser.addRule).toHaveBeenCalledTimes(2);
    expect(mockParser.getConst).toHaveBeenCalledTimes(4);
    expect(parseType).not.toHaveBeenCalled();
  });

  it('should parse object with const property', () => {
    const schema: JSONSchemaObject = {
      type: 'object',
      properties: {
        foo: { const: 'bar', },
      },
    };
    const mockParser = getMockParser();
    const expected = `${LEFT_BRACE_KEY} (${QUOTE_KEY} "foo" ${QUOTE_KEY} ${COLON_KEY} ${QUOTE_KEY} "bar" ${QUOTE_KEY})? ${RIGHT_BRACE_KEY}`;
    expect(parseObject(mockParser, schema)).toBe(expected);
    expect(mockParser.addRule).toHaveBeenCalledTimes(1);
    expect(mockParser.getConst).toHaveBeenCalledTimes(4);
    expect(parseType).not.toHaveBeenCalled();
  });

  it('should parse object with required properties', () => {
    const schema: JSONSchemaObject = {
      type: 'object',
      properties: {
        foo: { type: 'string', },
        bar: { type: 'number', },
      },
      required: ['foo'],
    };
    const mockParser = getMockParser();
    const expected = `${LEFT_BRACE_KEY} (${QUOTE_KEY} "foo" ${QUOTE_KEY} ${COLON_KEY} parsedType | ${QUOTE_KEY} "foo" ${QUOTE_KEY} ${COLON_KEY} parsedType ${COMMA_KEY} ${QUOTE_KEY} "bar" ${QUOTE_KEY} ${COLON_KEY} parsedType | ${QUOTE_KEY} "bar" ${QUOTE_KEY} ${COLON_KEY} parsedType ${COMMA_KEY} ${QUOTE_KEY} "foo" ${QUOTE_KEY} ${COLON_KEY} parsedType) ${RIGHT_BRACE_KEY}`;
    expect(parseObject(mockParser, schema)).toBe(expected);
    expect(mockParser.addRule).toHaveBeenCalledTimes(4);
    expect(mockParser.getConst).toHaveBeenCalledTimes(4);
    expect(parseType).toHaveBeenCalledTimes(2);
  });

  it('should parse object with fixed order', () => {
    const schema: JSONSchemaObject = {
      type: 'object',
      properties: {
        foo: { type: 'string', },
        bar: { type: 'number', },
      },
    };
    const mockParser = getMockParser(true);
    const expected = `${LEFT_BRACE_KEY} (${QUOTE_KEY} "foo" ${QUOTE_KEY} ${COLON_KEY} parsedType ${COMMA_KEY} ${QUOTE_KEY} "bar" ${QUOTE_KEY} ${COLON_KEY} parsedType) ${RIGHT_BRACE_KEY}`;
    expect(parseObject(mockParser, schema)).toBe(expected);
    expect(mockParser.addRule).toHaveBeenCalledTimes(2);
    expect(mockParser.getConst).toHaveBeenCalledTimes(4);
    expect(parseType).toHaveBeenCalledTimes(2);
  });
});
