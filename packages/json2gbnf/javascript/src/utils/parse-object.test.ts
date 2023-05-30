import {
  describe,
  afterEach,
  it,
  expect,
  vi,
} from 'vitest';
import {
  parseObject,
} from './parse-object.js';
import {
  COLON_KEY,
  COMMA_KEY,
  LEFT_BRACE_KEY,
  OBJECT_KEY,
  QUOTE_KEY,
  RIGHT_BRACE_KEY,
  STRING_KEY,
  VALUE_KEY,
} from '../constants/grammar-keys.js';
import { getMockGrammar } from './__mocks__/get-mock-grammar.js';
import { JSONSchemaObject } from '../types.js';

import {
  parseType,
} from './parse-type.js';
import type * as _parseType from './parse-type.js';
import { join, joinPipe } from 'gbnf/builder-v1';
import { OBJECT_KEY_DEF } from './get-property-definition.js';

vi.mock('./parse-type.js', async () => {
  const actual = await vi.importActual('./parse-type.js') as typeof _parseType;
  return {
    ...actual,
    parseType: vi.fn(() => 'parsedType'),
  };
});

describe('parseObject', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return OBJECT_KEY if properties is undefined', () => {
    const schema = {} as JSONSchemaObject;
    const mockGrammar = getMockGrammar();
    expect(parseObject(mockGrammar, schema)).toBe(OBJECT_KEY);
    expect(mockGrammar.addRule).not.toHaveBeenCalled();
    expect(mockGrammar.getConst).not.toHaveBeenCalled();
    expect(parseType).not.toHaveBeenCalled();
  });

  it('should throw an error if an unsupported key is present', () => {
    const schema = { patternProperties: {}, } as JSONSchemaObject;
    const mockGrammar = getMockGrammar();
    expect(() => parseObject(mockGrammar, schema)).toThrowError(
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
      additionalProperties: false,
    };
    vi.mocked(parseType).mockImplementation(() => 'parsedType');
    const mockGrammar = getMockGrammar();
    const expected = join(
      LEFT_BRACE_KEY,
      `(${joinPipe(
        join(
          QUOTE_KEY,
          `"foo"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
        ),
        join(
          QUOTE_KEY,
          `"foo"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
          COMMA_KEY,
          QUOTE_KEY,
          `"bar"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
        ),
        join(
          QUOTE_KEY,
          `"bar"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
        ),
        join(
          QUOTE_KEY,
          `"bar"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
          COMMA_KEY,
          QUOTE_KEY,
          `"foo"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`
        )
      )})?`,
      RIGHT_BRACE_KEY,
    );
    expect(parseObject(mockGrammar, schema)).toBe(expected);
    expect(parseType).toHaveBeenCalledTimes(2);
  });

  it('should parse object with enum property', () => {
    const schema: JSONSchemaObject = {
      type: 'object',
      properties: {
        foo: { enum: ['a', 'b'], },
      },
      additionalProperties: false,
    };
    vi.mocked(parseType).mockImplementation(() => 'parsedType');
    const mockGrammar = getMockGrammar();
    const expected = join(
      LEFT_BRACE_KEY,
      `(${joinPipe(
        join(
          QUOTE_KEY,
          `"foo"`,
          QUOTE_KEY,
          COLON_KEY,
          QUOTE_KEY,
          `"a"`,
          QUOTE_KEY,
        ),
        join(
          QUOTE_KEY,
          `"b"`,
          QUOTE_KEY,
        ))})?`,
      RIGHT_BRACE_KEY
    );
    expect(parseObject(mockGrammar, schema)).toBe(expected);
    expect(parseType).not.toHaveBeenCalled();
  });

  it('should parse object with const property', () => {
    const schema: JSONSchemaObject = {
      type: 'object',
      properties: {
        foo: {
          const: 'bar',
        },
      },
      additionalProperties: false,
    };
    vi.mocked(parseType).mockImplementation(() => 'parsedType');
    const mockGrammar = getMockGrammar();
    const expected = join(
      LEFT_BRACE_KEY,
      `(${join(
        QUOTE_KEY,
        `"foo"`,
        QUOTE_KEY,
        COLON_KEY,
        QUOTE_KEY,
        `"bar"`,
        QUOTE_KEY,
      )})?`,
      RIGHT_BRACE_KEY
    );
    expect(parseObject(mockGrammar, schema)).toBe(expected);
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
      additionalProperties: false,
    };
    vi.mocked(parseType).mockImplementation(() => 'parsedType');
    const mockGrammar = getMockGrammar();
    const expected = [
      LEFT_BRACE_KEY,
      `(${joinPipe(
        join(
          QUOTE_KEY,
          `"foo"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
        ),
        join(
          QUOTE_KEY,
          `"foo"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
          COMMA_KEY,
          QUOTE_KEY,
          `"bar"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
        ),
        join(
          QUOTE_KEY,
          '"bar"',
          QUOTE_KEY,
          COLON_KEY,
          'parsedType',
          COMMA_KEY,
          QUOTE_KEY,
          '"foo"',
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
        )
      )})`,
      RIGHT_BRACE_KEY,
    ].join(' ');
    expect(parseObject(mockGrammar, schema)).toBe(expected);
    expect(parseType).toHaveBeenCalledTimes(2);
  });

  it('should parse object with fixed order', () => {
    const schema: JSONSchemaObject = {
      type: 'object',
      properties: {
        foo: { type: 'string', },
        bar: { type: 'number', },
      },
      additionalProperties: false,
    };
    vi.mocked(parseType).mockImplementation(() => 'parsedType');
    const mockGrammar = getMockGrammar({
      fixedOrder: true,
    });
    const expected = join(
      LEFT_BRACE_KEY,
      `(${join(
        QUOTE_KEY,
        '"foo"',
        QUOTE_KEY,
        COLON_KEY,
        `parsedType`,
        COMMA_KEY,
        QUOTE_KEY,
        `"bar"`,
        QUOTE_KEY,
        COLON_KEY,
        `parsedType`
      )})`,
      RIGHT_BRACE_KEY,
    );
    expect(parseObject(mockGrammar, schema)).toBe(expected);
    expect(parseType).toHaveBeenCalledTimes(2);
  });

  describe('additionalProperties', () => {
    const PROPERTY_KEY = `(${join(
      COMMA_KEY,
      QUOTE_KEY,
      OBJECT_KEY_DEF,
      QUOTE_KEY,
      COLON_KEY,
      VALUE_KEY,
      `(${join(COMMA_KEY,
        QUOTE_KEY,
        OBJECT_KEY_DEF,
        QUOTE_KEY,
        COLON_KEY,
        VALUE_KEY,
      )})*`,
    )})?`;

    it('should parse object with properties and allow additional properties', () => {
      const schema: JSONSchemaObject = {
        type: 'object',
        additionalProperties: true,
        properties: {
          foo: { type: 'string', },
          bar: { type: 'number', },
        },
      };
      vi.mocked(parseType).mockImplementation((rule) => 'parsedType');
      const mockGrammar = getMockGrammar({
        addRule: vi.fn().mockImplementation((key: string) => key),
      });
      const expected = join(
        LEFT_BRACE_KEY,
        `(${joinPipe(
          join(
            QUOTE_KEY,
            `"foo"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
          ),
          join(
            QUOTE_KEY,
            `"foo"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
            COMMA_KEY,

            QUOTE_KEY,
            `"bar"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
          ),
          join(
            QUOTE_KEY,
            `"bar"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
          ),
          join(
            QUOTE_KEY,
            `"bar"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
            COMMA_KEY,
            QUOTE_KEY,
            `"foo"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
          )
        )})?`,
        RIGHT_BRACE_KEY,
      );
      expect(parseObject(mockGrammar, schema)).toBe(expected);
    });

    it('should parse object with required properties and allow additional properties', () => {
      const schema: JSONSchemaObject = {
        type: 'object',
        additionalProperties: true,
        properties: {
          foo: { type: 'string', },
          bar: { type: 'number', },
        },
        required: ['foo'],
      };
      vi.mocked(parseType).mockImplementation((rule) => 'parsedType');
      const mockGrammar = getMockGrammar({
        addRule: vi.fn().mockImplementation((key: string) => key),
      });
      const expected = join(
        LEFT_BRACE_KEY,
        `(${joinPipe(
          join(
            QUOTE_KEY,
            `"foo"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
          ),
          join(
            QUOTE_KEY,
            `"foo"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
            COMMA_KEY,

            QUOTE_KEY,
            `"bar"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
          ),
          join(
            QUOTE_KEY,
            `"bar"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
            COMMA_KEY,
            QUOTE_KEY,
            `"foo"`,
            QUOTE_KEY,
            COLON_KEY,
            `parsedType`,
            PROPERTY_KEY,
          )
        )})`,
        RIGHT_BRACE_KEY,
      );
      expect(parseObject(mockGrammar, schema)).toBe(expected);
    });

    it('should parse object with fixed order and allow additional properties', () => {
      const schema: JSONSchemaObject = {
        type: 'object',
        properties: {
          foo: { type: 'string', },
          bar: { type: 'number', },
        },
        additionalProperties: true,
      };
      vi.mocked(parseType).mockImplementation(() => 'parsedType');
      const mockGrammar = getMockGrammar({
        addRule: vi.fn().mockImplementation((key: string) => key),
        fixedOrder: true,
      });
      const expected = join(
        LEFT_BRACE_KEY,
        `(${join(
          QUOTE_KEY,
          '"foo"',
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
          COMMA_KEY,
          QUOTE_KEY,
          `"bar"`,
          QUOTE_KEY,
          COLON_KEY,
          `parsedType`,
          PROPERTY_KEY,
        )})`,
        RIGHT_BRACE_KEY,
      );
      expect(parseObject(mockGrammar, schema)).toBe(expected);
      expect(parseType).toHaveBeenCalledTimes(2);
    });
  });
});
