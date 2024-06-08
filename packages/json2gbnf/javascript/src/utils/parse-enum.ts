import {
  JSONSchemaObjectValueEnum,
} from "../types.js";
import {
  quote,
} from '../constants.js';
import {
  GBNFRule,
  _,
} from 'gbnf/builder';

export const parseEnum = (
  schema: JSONSchemaObjectValueEnum,
): GBNFRule => {
  if (schema.enum.length === 0) {
    throw new Error('Enum must have at least one value');
  }
  return _`${schema.enum.map(value => {
    if (typeof value === 'string') {
      return _`${quote} ${JSON.stringify(value)} ${quote}`;
    }
    return _`"${JSON.stringify(value)}"`;
  })}`.separate(' | ');
};
