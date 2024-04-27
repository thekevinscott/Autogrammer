// parse.ts
import { KEYS, NULL_KEY, } from "../constants/grammar-keys.js";
import {
  type SchemaParser,
} from "../schema-parser.js";
import {
  isSchemaEnum,
} from "../type-guards.js";
import {
  JSONSchema,
  ParseTypeArg,
} from "../types.js";
import { parseType, } from "./parse-type.js";

export const parse = (
  parser: SchemaParser,
  schema: JSONSchema,
  symbolName: string,
) => {
  if (isSchemaEnum(schema)) {
    parser.addRule(`${schema.enum.map(e => {
      const type = JSON.stringify(e);
      if (type === 'null') {
        return NULL_KEY;
      }
      return JSON.stringify(type);
    }).join(" | ")}`, symbolName);
  } else {
    const { type, } = schema;
    if (Array.isArray(type)) {
      // if type is an array, then it must not be a structured data type
      parser.addRule(`${type.map(_type => {
        const key = `${_type.toUpperCase()}_KEY`;
        if (!(key in KEYS)) {
          throw new Error(`Unknown type ${_type} for schema ${JSON.stringify(schema)}`);
        }
        return KEYS[key];
      }).join(' | ')}`, symbolName);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const ruleDef = parseType(parser, schema as unknown as ParseTypeArg);
      parser.addRule(`${ruleDef}`, symbolName);
    }
  }
};
