import {
  join,
} from "gbnf/builder-v1";
import { star, } from "../utils/get-star.js";
import { any, } from "../utils/any.js";
import { rule, } from "../utils/get-rule.js";
import { opt, } from "../utils/get-optional.js";

export const getPossibleColumnsWithAlias = ({
  columnNames: possibleColumnNames,
  windowStatement,
  asAlias,
  whitespace,
  overStatement,
}: {
  asAlias: string;
  columnNames: string
  windowStatement: string;
  whitespace: string;
  overStatement: string;
}) => {
  const possibleColumnsWithOver = any(
    possibleColumnNames,
    windowStatement,
    rule(
      any(possibleColumnNames, windowStatement),
      whitespace,
      overStatement,
    ),
  );
  return any(
    possibleColumnsWithOver,
    rule(
      possibleColumnsWithOver,
      opt(whitespace, asAlias),
    ),
  );
};

export const getProjectionWithSpecificColumns = ({
  optionalRecommendedWhitespace,
  comma,
  possibleColsWithAlias,
}: {
  possibleColsWithAlias: string;
  optionalRecommendedWhitespace: string,
  comma: string;
}): string => join(
  possibleColsWithAlias,
  star(
    comma,
    optionalRecommendedWhitespace,
    possibleColsWithAlias,
  ),
);
