import {
  GrammarBuilder,
  $,
} from "gbnf/builder-v2";
import type {
  CaseKind,
  Database,
  WhitespaceKind,
} from "../types.js";
import { star, } from "../utils/get-star.js";
import {
  NULL,
  VALUE,
} from "../gbnf-keys.js";
import { getInsertQuery, } from "./get-insert-query.js";
import { rule, } from "../utils/get-rule.js";
import {
  BOOLEAN,
  COMMA_KEY,
  LEFT_PAREN_KEY,
  NUMBER,
  RIGHT_PAREN_KEY,
} from "../constants/grammar-keys.js";
import { any, } from "../utils/any.js";
import {
  select as getSelectRule,
} from '../select/index.js';
import { addShorthand, } from "../add-shorthand.js";

export const insert = (
  parser: GrammarBuilder,
  KEYS: Record<string, string>,
  opts: {
    whitespace: WhitespaceKind;
    case: CaseKind,
  },
  database: void | Database,
  {
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
    validFullName,
  }: {
    stringWithQuotes: string;
    optionalRecommendedWhitespace: string;
    optionalNonRecommendedWhitespace: string;
    mandatoryWhitespace: string;
    validFullName: string;
  }
): string => {
  const columnList = rule(
    validFullName,
    star(
      COMMA_KEY,
      optionalRecommendedWhitespace,
      validFullName,
    ),
  );

  const selectRule = rule(getSelectRule(parser, KEYS, opts, database, {
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
    withUnion: false,
    singleColumn: true,
  }));

  const value = parser.addRule(any(
    stringWithQuotes,
    NUMBER,
    BOOLEAN,
    NULL,
    any(
      selectRule,
      rule(
        LEFT_PAREN_KEY,
        selectRule,
        RIGHT_PAREN_KEY,
      ),
    ),
  ), VALUE);

  const valuesList = rule(
    value,
    star(
      COMMA_KEY,
      optionalRecommendedWhitespace,
      value,
    ),
  );

  const INSERT = 'insert';
  addShorthand($.key(INSERT)`INSERT INTO `, parser);

  return getInsertQuery({
    insert: INSERT,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    tableName: validFullName,
    lparen: LEFT_PAREN_KEY,
    rparen: RIGHT_PAREN_KEY,
    columnList,
    values: KEYS['values'],
    valuesList,
  });
};
