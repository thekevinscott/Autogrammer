import { parseArray, } from './parse-array.js';
import { parseObject, } from './parse-object.js';
import { parseString, } from './parse-string.js';
import {
  BOOLEAN_KEY,
  INTEGER_KEY,
  NULL_KEY,
  NUMBER_KEY,
} from '../constants/grammar-keys.js';
import type {
  ParseTypeArg,
} from '../types.js';
import {
  type Grammar,
} from '../grammar.js';

export const parseType = (
  parser: Grammar,
  schema: ParseTypeArg,
): string => {
  const { type, } = schema;
  if (type === 'string') {
    return parseString(schema);
  } else if (type === 'integer' || type === 'number') {
    for (const key of ['exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'minimum', 'maximum',]) {
      if (schema[key] !== undefined) {
        throw new Error(`${key} is not supported`);
      }
    }
    if (type === 'number') {
      return NUMBER_KEY;
    } else {
      return INTEGER_KEY;
    }
  } else if (type === 'boolean') {
    return BOOLEAN_KEY;
  } else if (type === 'null') {
    return NULL_KEY;
  } else if (type === 'array') {
    return parseArray(parser, schema);
  } else if (type === 'object') {
    return parseObject(parser, schema);
  }
  throw new Error(`type for schema ${JSON.stringify(schema)} is not supported`);
};
