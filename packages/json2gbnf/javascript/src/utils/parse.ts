// parse.ts
import {
  KEYS,
  NULL_KEY,
} from "../constants/grammar-keys.js";
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
  join,
  joinWith,
} from "gbnf/builder-v1";
import { parseType, } from "./parse-type.js";

export const parse = (
  parser: Grammar,
  schema: JSONSchema,
  symbolName: string,
) => {
  if (isSchemaMultipleBasicTypes(schema)) {
    // if type is an array, then it must not be a structured data type
    parser.addRule(
      joinWith(
        ' | ',
        ...schema.type.map(type => {
          const key = `${type.toUpperCase()}_KEY`;
          if (!(key in KEYS)) {
            throw new Error(`Unknown type ${type} for schema ${JSON.stringify(schema)}`);
          }
          return KEYS[key];
        })),
      symbolName,
    );
  } else if (isSchemaEnum(schema)) {
    parser.addRule(
      joinWith(
        " | ",
        ...schema.enum.map(e => JSON.stringify(e)).map(type => type === 'null' ? NULL_KEY : JSON.stringify(type))
      ),
      symbolName,
    );
  } else if (isSchemaConst(schema)) {
    parser.addRule(
      join(...getConstDefinition(schema)),
      symbolName,
    );
  } else {
    parser.addRule(
      parseType(parser, schema),
      symbolName,
    );
  }
};
