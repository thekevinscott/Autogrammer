import {
  join,
} from "gbnf/builder-v1";
import {
  $,
  GrammarBuilder,
} from "gbnf/builder-v2";
import { rule, } from "../utils/get-rule.js";
import { addShorthand, } from "../add-shorthand.js";

export const getInsertQuery = (parser: GrammarBuilder, {
  optionalRecommendedWhitespace,
  optionalNonRecommendedWhitespace,
  tableName,
  columnList,
  lparen,
  rparen,
  values,
  valuesList,
}: {
  optionalRecommendedWhitespace: string;
  optionalNonRecommendedWhitespace: string;
  tableName: string;
  lparen: string;
  rparen: string;
  columnList: string;
  values: string;
  valuesList: string;
}) => {
  const INSERT = 'insert';
  addShorthand($.key(INSERT)`INSERT INTO `, parser);
  const columnInsertList = rule(
    optionalRecommendedWhitespace,
    lparen,
    optionalNonRecommendedWhitespace,
    columnList,
    optionalNonRecommendedWhitespace,
    rparen,
    optionalRecommendedWhitespace,
  );
  const valueInsertList = rule(
    optionalRecommendedWhitespace,
    lparen,
    optionalNonRecommendedWhitespace,
    valuesList,
    optionalNonRecommendedWhitespace,
    rparen,
    optionalRecommendedWhitespace,
  );
  return join(
    INSERT,
    tableName,
    columnInsertList,
    values,
    valueInsertList,
  );
};
