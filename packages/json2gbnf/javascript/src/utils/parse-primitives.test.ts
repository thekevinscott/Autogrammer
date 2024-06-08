import {
  describe,
  test,
  expect,
} from 'vitest';
import { parsePrimitives } from './parse-primitives.js';
import {
  _,
} from 'gbnf/builder-v2';
import { JSONSchemaMultiplePrimitiveTypes } from '../types.js';
import { array, boolean, nll, number, object, string } from '../constants.js';

describe('Multiple Primitives', () => {
  test('should parse schema with a handful of primitives', () => {
    const schema: JSONSchemaMultiplePrimitiveTypes = {
      type: ['string', 'number',],
    };
    const rule = parsePrimitives(schema);
    expect(rule.compile()).toEqual(_`${[string, number]}`.separate(' | ').compile());
  });

  test('should parse schema with all primitives', () => {
    const schema: JSONSchemaMultiplePrimitiveTypes = {
      type: ['string', 'number', 'boolean', 'null', 'object', 'array',],
    };
    const rule = parsePrimitives(schema);
    expect(rule.compile()).toEqual(_`${[string, number, boolean, nll, object, array]}`.separate(' | ').compile());
  });

  test('should throw an error for unknown types', () => {
    const schema: JSONSchemaMultiplePrimitiveTypes = {
      type: ['unknown' as any],
    };
    expect(() => {
      parsePrimitives(schema);
    }).toThrowError(new Error('Unknown type unknown for schema {"type":["unknown"]}'));
  });
})
