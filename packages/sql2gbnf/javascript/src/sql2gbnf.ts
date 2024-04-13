import { Grammar, } from "./grammar.js";
import { parse, } from "./parse.js";


export function SQL2GBNF(
  // eslint-disable-next-line @typescript-eslint/ban-types
  schema?: string,
): string {
  const parser = new Grammar({});
  parse(parser, 'root', schema);

  return parser.grammar;
};
