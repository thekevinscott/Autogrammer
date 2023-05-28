import {
  GrammarBuilder,
  joinWith,
} from "gbnf";
import {
  parse,
} from "./parse.js";
import {
  GLOBAL_CONSTANTS,
} from "./constants/constants.js";
import type {
  DBMLSchemaOpts,
  SchemaOpts,
} from "./types.js";
import {
  getDBML,
} from "./get-dbml.js";

export const ROOT_ID = 'sqltogbnf';

export function SQL2GBNF(schemaDef: DBMLSchemaOpts = {}, {
  whitespace = 'default',
  case: caseKind = 'any',
}: SchemaOpts = {}): string {
  const database = getDBML(schemaDef);
  const parser = new GrammarBuilder();

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
