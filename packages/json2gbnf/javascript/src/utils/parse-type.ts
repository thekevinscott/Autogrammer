import { parseArray, } from './parse-array.js';
import { parseObject, } from './parse-object.js';
import { parseString, } from './parse-string.js';
import type {
  ParseTypeArg,
} from '../types.js';
import {
  type Grammar,
} from '../grammar.js';
import { parseNumber, } from './parse-number.js';
import { isSchemaNumber, isSchemaString, } from '../type-guards.js';
import {
  GBNFRule,
  _,
} from 'gbnf/builder-v2';
import { boolean, nll, } from '../constants.js';

export const parseType = (
  parser: Grammar,
  schema: ParseTypeArg,
): GBNFRule => {
  const { type, } = schema;
  if (type === 'boolean') {
    return boolean;
  } else if (type === 'null') {
    return nll;
  } else if (isSchemaString(schema)) {
    return parseString(schema);
  } else if (isSchemaNumber(schema)) {
    return parseNumber(schema);
  } else if (type === 'array') {
    return parseArray(schema);
  } else if (type === 'object') {
    return _`${parseObject(parser, schema)}`;
  }
  throw new Error(`type for schema ${JSON.stringify(schema)} is not supported`);
};
