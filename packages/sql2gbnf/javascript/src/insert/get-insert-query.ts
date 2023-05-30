import {
  join,
} from "gbnf/builder-v1";
import { rule, } from "../utils/get-rule.js";

export const getInsertQuery = ({
  insert,
  optionalRecommendedWhitespace,
  optionalNonRecommendedWhitespace,
  tableName,
  columnList,
  lparen,
  rparen,
  values,
  valuesList,
}: {
  insert: string;
  optionalRecommendedWhitespace: string;
  optionalNonRecommendedWhitespace: string;
  tableName: string;
  lparen: string;
  rparen: string;
  columnList: string;
  values: string;
  valuesList: string;
}) => {
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
    insert,
    tableName,
    columnInsertList,
    values,
    valueInsertList,
  );
};
