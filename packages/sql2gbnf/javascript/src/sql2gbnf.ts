import {
  GrammarBuilder,
} from "gbnf/builder-v2";
import {
  parse,
} from "./parse.js";
import type {
  DBMLSchemaOpts,
  SchemaOpts,
} from "./types.js";
import {
  getDBML,
} from "./get-dbml.js";
import {
  buildGBNF,
} from "./utils/build-gbnf.js";

export function SQL2GBNF(schemaDef: DBMLSchemaOpts = {}, {
  whitespace = 'default',
  case: caseKind = 'any',
}: SchemaOpts = {}): string {
  const database = getDBML(schemaDef);
  const parser = new GrammarBuilder();

  const gbnf = parse(
    parser,
    {
      whitespace,
      case: caseKind,
    },
    database,
  );
  parser.addRule(gbnf, 'root');

  return buildGBNF(parser);
};
