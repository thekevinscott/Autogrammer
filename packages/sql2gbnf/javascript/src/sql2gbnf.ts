import {
  GrammarBuilder,
  joinWith,
} from "gbnf";
import { parse, } from "./parse.js";
import { GLOBAL_CONSTANTS, } from "./constants/constants.js";

export const ROOT_ID = 'sqltogbnf';

export function SQL2GBNF(
  // schema?: string,
): string {
  const parser = new GrammarBuilder({
    whitespace: 1,
  });

  parse(
    parser,
    ROOT_ID,
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
