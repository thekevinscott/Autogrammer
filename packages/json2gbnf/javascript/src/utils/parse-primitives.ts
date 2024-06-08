import {
  array,
  boolean,
  nll,
  number,
  object,
  string,
} from "../constants.js";
import {
  type GBNFRule,
  _,
} from 'gbnf/builder-v2';
import {
  PrimitiveType,
  type JSONSchemaMultiplePrimitiveTypes,
} from "../types.js";

const PRIMITIVE_TYPES: Record<PrimitiveType, GBNFRule> = {
  string,
  number,
  boolean,
  'null': nll,
  object,
  array,
};

export const parsePrimitives = (schema: JSONSchemaMultiplePrimitiveTypes) => {
  // if type is an array, then it must not be a structured data type
  for (const type of schema.type) {
    if (!Object.keys(PRIMITIVE_TYPES).includes(type)) {
      throw new Error(`Unknown type ${type} for schema ${JSON.stringify(schema)}`);
    }
  }
  return _` ${schema.type.map(type => PRIMITIVE_TYPES[type])} `.separate(' | ');
};
