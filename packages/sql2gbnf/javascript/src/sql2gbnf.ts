import {
  GrammarBuilder,
  joinWith,
} from "gbnf";
import { parse, } from "./parse.js";
import { GLOBAL_CONSTANTS, } from "./constants/constants.js";
import { SchemaOpts, } from "./types.js";
import { getDBML, } from "./get-dbml.js";

export const ROOT_ID = 'sqltogbnf';

export function SQL2GBNF({
  whitespace = 'default',
  case: caseKind = 'any',
  schema,
  schemaFormat,
}: SchemaOpts = {}): string {
  const database = getDBML({
    schema,
    schemaFormat,
  });
  const parser = new GrammarBuilder({
  });

  parse(
    parser,
    ROOT_ID,
    {
      whitespace,
      case: caseKind,
    },
    database,
  );

  return joinWith('\n',
    ...[
      `root ::= ${ROOT_ID}`,
      ...parser.grammar,
    ].sort(),
    ...GLOBAL_CONSTANTS,
  );
};
