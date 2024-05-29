import {
  GLOBAL_CONSTANTS,
} from './constants/constants.js';
import {
  VALUE_KEY,
} from './constants/grammar-keys.js';
import {
  Grammar as Grammar,
} from './grammar.js';
import {
  isEmptyObject,
  hasDollarSchemaProp,
} from './type-guards.js';
import {
  type JSONSchema,
  type SchemaOpts,
} from './types.js';
import {
  parse,
} from './utils/parse.js';
import {
  joinWith,
} from 'gbnf/builder';

// https://json-schema.org/understanding-json-schema/basics
// false will always be invalid
export const BLANK_GRAMMAR = `root ::= ""`;

export const ROOT_ID = 'jsontogbnf';

export function JSON2GBNF<T extends JSONSchema>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  schema?: {} | null | T | boolean,
  opts?: SchemaOpts,
): string {
  if (schema === null || schema === undefined) {
    throw new Error('Bad schema provided');
  }
  if (schema === false) {
    return BLANK_GRAMMAR;
  }
  if (schema !== true && hasDollarSchemaProp(schema) && schema['$schema'] !== 'https://json-schema.org/draft/2020-12/schema') {
    throw new Error(`Unsupported schema version: ${schema['$schema']}`);
  }

  const parser = new Grammar(opts);
  if (schema === true || isEmptyObject(schema)) {
    parser.addRule(VALUE_KEY, ROOT_ID);
  } else {
    parse(
      parser,
      schema,
      ROOT_ID,
    );
  }

  return joinWith('\n',
    `root ::= ${ROOT_ID}`,
    ...parser.grammar,
    ...GLOBAL_CONSTANTS,
  );
};
