import {
  getGBNF,
} from "./get-gbnf.js";
import type {
  DBMLSchemaOpts,
  SchemaOpts,
} from "./types.js";
import {
  getDBML,
} from "./get-dbml.js";

export function SQL2GBNF(schemaDef: DBMLSchemaOpts = {}, {
  whitespace = 'default',
  case: caseKind = 'any',
}: SchemaOpts = {}): string {
  const database = getDBML(schemaDef);

  const gbnf = getGBNF({
    whitespace,
    case: caseKind,
  }, database);
  return gbnf.compile({
    caseKind,
  });
};
