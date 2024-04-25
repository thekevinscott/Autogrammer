import { describe, it, expect } from 'vitest';
import { parseEnum } from './parse-enum.js';
import { QUOTE_KEY } from '../constants/grammar-keys.js';
import { JSONSchemaObjectValueEnum } from '../types.js';

describe('parseEnum', () => {
  it('should return the correct rule for an enum with a single value', () => {
    const schema: JSONSchemaObjectValueEnum = {
      enum: ['foo'],
    };
    const addRule = (rule: string) => rule;
    const expected = `${QUOTE_KEY} "foo" ${QUOTE_KEY}`;
    expect(parseEnum(schema, addRule)).toBe(expected);
  });

  it('should return the correct rule for an enum with multiple values', () => {
    const schema: JSONSchemaObjectValueEnum = {
      enum: ['foo', 'bar', 'baz'],
    };
    const addRule = (rule: string) => rule;
    const expected = `${QUOTE_KEY} "foo" ${QUOTE_KEY} | ${QUOTE_KEY} "bar" ${QUOTE_KEY} | ${QUOTE_KEY} "baz" ${QUOTE_KEY}`;
    expect(parseEnum(schema, addRule)).toBe(expected);
  });

  it('should call addRule with the correct rule', () => {
    const schema: JSONSchemaObjectValueEnum = {
      enum: ['foo', 'bar'],
    };
    const addRule = vi.fn((rule: string) => rule);
    const expected = `${QUOTE_KEY} "foo" ${QUOTE_KEY} | ${QUOTE_KEY} "bar" ${QUOTE_KEY}`;
    parseEnum(schema, addRule);
    expect(addRule).toHaveBeenCalledWith(expected);
  });

  it('should handle enum values with special characters', () => {
    const schema: JSONSchemaObjectValueEnum = {
      enum: ['foo', 'bar', 'baz!@#$%^&*()'],
    };
    const addRule = (rule: string) => rule;
    const expected = `${QUOTE_KEY} "foo" ${QUOTE_KEY} | ${QUOTE_KEY} "bar" ${QUOTE_KEY} | ${QUOTE_KEY} "baz!@#$%^&*()" ${QUOTE_KEY}`;
    expect(parseEnum(schema, addRule)).toBe(expected);
  });

  it('should handle an empty enum', () => {
    const schema: JSONSchemaObjectValueEnum = {
      enum: [],
    };
    const addRule = (rule: string) => rule;
    const expected = '';
    expect(parseEnum(schema, addRule)).toBe(expected);
  });
});
