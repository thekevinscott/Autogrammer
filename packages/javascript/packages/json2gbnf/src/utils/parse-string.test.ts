import { describe, it, expect } from 'vitest';
import { parseString } from './parse-string.js';
import {
  CHAR_KEY,
  QUOTE_KEY,
  STRING_KEY,
} from '../constants/grammar-keys.js';
import { JSONSchemaString } from '../types.js';

describe('parseString', () => {
  it('should return STRING_KEY when minLength and maxLength are undefined', () => {
    expect(parseString({} as JSONSchemaString)).toBe(STRING_KEY);
  });

  it('should throw an error when pattern is defined', () => {
    const schema = {
      pattern: '^[a-z]+$',
    };
    expect(() => parseString(schema as JSONSchemaString)).toThrowError('pattern is not supported');
  });

  it('should throw an error when format is defined', () => {
    const schema = {
      format: 'email',
    };
    expect(() => parseString(schema as JSONSchemaString)).toThrowError('format is not supported');
  });

  it('should throw an error when minLength is greater than maxLength', () => {
    const schema = {
      minLength: 5,
      maxLength: 3,
    };
    expect(() => parseString(schema as JSONSchemaString)).toThrowError('minLength must be less than or equal to maxLength');
  });

  it('should return the correct string when minLength and maxLength are defined', () => {
    const schema = {
      minLength: 2,
      maxLength: 5,
    };
    const expected = `${QUOTE_KEY} ${CHAR_KEY} ${CHAR_KEY} (${CHAR_KEY})? (${CHAR_KEY})? (${CHAR_KEY})? ${QUOTE_KEY}`;
    expect(parseString(schema as JSONSchemaString)).toBe(expected);
  });

  it('should return the correct string when only minLength is defined', () => {
    const schema = {
      minLength: 3,
    };
    const expected = `${QUOTE_KEY} ${CHAR_KEY} ${CHAR_KEY} (${CHAR_KEY})+ ${QUOTE_KEY}`;
    expect(parseString(schema as JSONSchemaString)).toBe(expected);
  });

  it('should return the correct string when only maxLength is defined', () => {
    const schema = {
      maxLength: 4,
    };
    const expected = `${QUOTE_KEY} (${CHAR_KEY})? (${CHAR_KEY})? (${CHAR_KEY})? (${CHAR_KEY})? ${QUOTE_KEY}`;
    expect(parseString(schema as JSONSchemaString)).toBe(expected);
  });

  it('should return the correct string when minLength is 0', () => {
    const schema = {
      minLength: 0,
      maxLength: 3,
    };
    const expected = `${QUOTE_KEY} (${CHAR_KEY})? (${CHAR_KEY})? (${CHAR_KEY})? ${QUOTE_KEY}`;
    expect(parseString(schema as JSONSchemaString)).toBe(expected);
  });

  it('should return the correct string when maxLength is 0', () => {
    const schema = {
      minLength: 0,
      maxLength: 0,
    };
    const expected = `${QUOTE_KEY} ${QUOTE_KEY}`;
    expect(parseString(schema as JSONSchemaString)).toBe(expected);
  });
});
