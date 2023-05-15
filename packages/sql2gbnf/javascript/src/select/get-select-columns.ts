import {
  GrammarBuilder,
  join,
  joinPipe,
} from "gbnf";
import {
  COMMA_KEY,
} from "../constants/grammar-keys.js";
import {
  SELECT_COLUMNS,
} from "../gbnf-keys.js";
import { star, } from "./get-star.js";
import { rule, } from "./get-rule.js";

export const getSelectColumns = (parser: GrammarBuilder, {
  columnNames,
  leadStatement: leadStatement,
  optionalRecommendedWhitespace,
}: {
  optionalRecommendedWhitespace: string,
  columnNames: string
  leadStatement: string;
}): string => {
  const possibleColumns = rule(joinPipe(
    columnNames,
    leadStatement,
  ));
  const selectColumnStatement = parser.addRule(join(
    possibleColumns,
    star(
      COMMA_KEY,
      optionalRecommendedWhitespace,
      possibleColumns,
    ),
  ), `${SELECT_COLUMNS}inner`);
  return rule(joinPipe(selectColumnStatement, '"*"'));
};
