import {
  GrammarBuilder,
  joinWith,
} from "gbnf";
import { parse, } from "./parse.js";
import { GLOBAL_CONSTANTS, } from "./constants/constants.js";

export function SQL2GBNF(
  schema?: string,
): string {
  const parser = new GrammarBuilder({
    whitespace: 1,
  });

  parse(parser, 'root', schema);

  return joinWith('\n',
    ...parser.grammar,
    ...GLOBAL_CONSTANTS,
  );
};
