import {
  GrammarBuilder,
  $,
  _,
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
  const selectRule = rule(getSelectRule(parser, KEYS, opts, database, {
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
    withUnion: false,
    singleColumn: true,
  }));

  const value = _`(${stringWithQuotes} | ${NUMBER} | ${BOOLEAN} | ${NULL} | ${selectRule} | "(" ${selectRule} ")")`;

  const valuesList = 'values-list';
  addShorthand(_.key(valuesList)`
  (
    ${value}
    (
      "," ${optionalRecommendedWhitespace} ${value}
    )*

  )
  `, parser);

  const columnList = 'column-list';
  addShorthand(_.key(columnList)`
  (
    ${validFullName}
    (
      "," ${optionalRecommendedWhitespace} ${validFullName}
    )*
  )
  `, parser);

  return getInsertQuery(parser, {
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
