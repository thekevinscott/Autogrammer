import {
  ARRAY_KEY,
  COMMA_KEY,
  LEFT_BRACKET_KEY,
  RIGHT_BRACKET_KEY,
} from '../constants/grammar-keys.js';
import { join, joinWith, } from './join.js';
import { KEYS, } from '../constants/grammar-keys.js';
import type {
  JSONSchemaArray,
  PrimitiveType,
} from '../types.js';
import type {
  Grammar,
} from '../grammar.js';
import {
  isSchemaArrayWithBooleanItemsType,
  isSchemaArrayWithoutItems,
} from '../type-guards.js';

const UNSUPPORTED_PROPERTIES = [
  'prefixItems',
  'unevaluatedItems',
  'contains',
  'minContains',
  'maxContains',
  'minItems',
  'maxItems',
  'uniqueItems',
];

export const parseArray = (
  parser: Grammar,
  schema: JSONSchemaArray,
): string => {
  for (const key of UNSUPPORTED_PROPERTIES) {
    if (schema[key] !== undefined) {
      throw new Error(`${key} is not supported`);
    }
  }
  if (isSchemaArrayWithBooleanItemsType(schema)) {
    throw new Error('boolean items is not supported, because prefixItems is not supported');
  }
  if (isSchemaArrayWithoutItems(schema)) {
    return ARRAY_KEY;
  }
  const types = ([] as PrimitiveType[]).concat(schema.items.type).map((type: string) => KEYS[`${type.toUpperCase()}_KEY`] ?? type);
  const symbolId = types.length > 1 ? parser.addRule(joinWith(' | ', ...types)) : types[0];
  return join(
    parser.getConst(LEFT_BRACKET_KEY, { left: false, }),
    `(${symbolId} (${parser.getConst(COMMA_KEY)} ${symbolId})*)?`,
    parser.getConst(RIGHT_BRACKET_KEY, { right: false, }),
  );
};
