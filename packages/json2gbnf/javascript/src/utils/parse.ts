import {
  type Grammar,
} from "../grammar.js";
import {
  isSchemaConst,
  isSchemaEnum,
  isSchemaMultipleBasicTypes,
} from "../type-guards.js";
import type {
  JSONSchema,
} from "../types.js";
import { getConstDefinition, } from "./get-const-definition.js";
import {
  _,
  GBNFRule,
} from 'gbnf/builder-v2';
import { parseType, } from "./parse-type.js";
import { parseEnum, } from "./parse-enum.js";
import {
  array,
  boolean,
  nll,
  number,
  object,
  string,
} from "../constants.js";

export const parse = (
  parser: Grammar,
  schema: JSONSchema,
): GBNFRule => {
  if (isSchemaMultipleBasicTypes(schema)) {
    // if type is an array, then it must not be a structured data type
    for (const type of schema.type) {
      if (![
        'string',
        'number',
        'boolean',
        'null',
        'object',
        'array',
      ].includes(type)) {
        throw new Error(`Unknown type ${type} for schema ${JSON.stringify(schema)}`);
      }
    }
    return _`
    ${schema.type.map(type => {
      return {
        string,
        number,
        boolean,
        'null': nll,
        object,
        array,
      }[type];
    })}
    `.separate(' | ');
  } else if (isSchemaEnum(schema)) {
    return parseEnum(schema);
  } else if (isSchemaConst(schema)) {
    return getConstDefinition(schema);
  }
  return _`${parseType(parser, schema)}`;
};
