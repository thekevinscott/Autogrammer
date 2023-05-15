import {
  GrammarBuilder,
  joinWith,
} from "gbnf";
import { parse, } from "./parse.js";
import { GLOBAL_CONSTANTS, } from "./constants/constants.js";
import { SchemaOpts, } from "./types.js";

export const ROOT_ID = 'sqltogbnf';

export function SQL2GBNF({
  whitespace = 'default',
  case: caseKind = 'any',
}: SchemaOpts = {}): string {
  const parser = new GrammarBuilder({
    // whitespace,
  });

  parse(
    parser,
    ROOT_ID,
    {
      whitespace,
      case: caseKind,
    }
    // schema,
  );

  return joinWith('\n',
    ...[
      `root ::= ${ROOT_ID}`,
      ...parser.grammar,
    ].sort(),
    ...GLOBAL_CONSTANTS,
  );
};
