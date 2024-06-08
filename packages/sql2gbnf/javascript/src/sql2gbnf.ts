import {
  getSQLGBNF,
} from "./get-sql-gbnf.js";
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

  return getSQLGBNF({
    whitespace,
    case: caseKind,
  }, database).compile({
    caseKind,
  });
};
