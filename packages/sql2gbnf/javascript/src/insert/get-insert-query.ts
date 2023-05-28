import {
  join,
} from "gbnf";
import { rule, } from "../utils/get-rule.js";

export const getInsertQuery = ({
  insert,
  into,
  optionalRecommendedWhitespace,
  optionalNonRecommendedWhitespace,
  mandatoryWhitespace: ws,
  tableName,
  columnList,
  lparen,
  rparen,
  values,
  valuesList,
}: {
  insert: string;
  into: string;
  optionalRecommendedWhitespace: string;
  optionalNonRecommendedWhitespace: string;
  mandatoryWhitespace: string;
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
    ws,
    into,
    ws,
    tableName,
    columnInsertList,
    values,
    valueInsertList,
  );
};
