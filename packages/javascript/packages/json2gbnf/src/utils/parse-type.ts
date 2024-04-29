import { parseArray, } from './parse-array.js';
import { parseObject, } from './parse-object.js';
import { parseString, } from './parse-string.js';
import {
  BOOLEAN_KEY,
  NULL_KEY,
} from '../constants/grammar-keys.js';
import type {
  ParseTypeArg,
} from '../types.js';
import {
  type Grammar,
} from '../grammar.js';
import { parseNumber, } from './parse-number.js';
import { isSchemaNumber, isSchemaString, } from '../type-guards.js';

export const parseType = (
  parser: Grammar,
  schema: ParseTypeArg,
): string => {
  const { type, } = schema;
  if (type === 'boolean') {
    return BOOLEAN_KEY;
  } else if (type === 'null') {
    return NULL_KEY;
  } else if (isSchemaString(schema)) {
    return parseString(schema);
  } else if (isSchemaNumber(schema)) {
    return parseNumber(schema);
  } else if (type === 'array') {
    return parseArray(parser, schema);
  } else if (type === 'object') {
    return parseObject(parser, schema);
  }
  throw new Error(`type for schema ${JSON.stringify(schema)} is not supported`);
};
