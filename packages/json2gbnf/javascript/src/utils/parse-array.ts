import {
  GBNFRule,
  _,
} from 'gbnf/builder-v2';
import type {
  JSONSchemaArray,
  PrimitiveType,
} from '../types.js';
import {
  isSchemaArrayWithBooleanItemsType,
  isSchemaArrayWithoutItems,
} from '../type-guards.js';
import {
  array,
  boolean,
  nll,
  number,
  object,
  string,
} from '../constants.js';

const UNSUPPORTED_PROPERTIES: (keyof JSONSchemaArray)[] = [
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
  schema: JSONSchemaArray,
): GBNFRule => {
  for (const key of UNSUPPORTED_PROPERTIES) {
    if (schema[key] !== undefined) {
      throw new Error(`${key} is not supported`);
    }
  }
  if (isSchemaArrayWithBooleanItemsType(schema)) {
    throw new Error('boolean items is not supported, because prefixItems is not supported');
  }
  if (isSchemaArrayWithoutItems(schema)) {
    return array;
  }
  const types = ([] as PrimitiveType[]).concat(schema.items.type);
  const possibleValue = _`${types.map((type) => {
    return {
      string,
      number,
      array,
      boolean,
      'null': nll,
      object,
    }[type];
  })}`.separate('|');
  return _`
  "["
  ${_`
      ${possibleValue} 
      ${_`
        ","
        ${possibleValue}
      `.wrap('*')}
    `.wrap('?')}
  "]"
  `;
};
