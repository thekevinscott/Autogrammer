import {
  join,
} from "gbnf";
import {
  COMMA_KEY,
} from "../constants/grammar-keys.js";
import { star, } from "./get-star.js";
import { any, } from "../utils/any.js";
import { rule, } from "./get-rule.js";
import { opt, } from "./get-optional.js";

export const getProjection = ({
  projectionWithSpecificColumns,
}: {
  projectionWithSpecificColumns: string;
}): string => any(projectionWithSpecificColumns, '"*"');

export const getProjectionWithSpecificColumns = ({
  columnNames: possibleColumnNames,
  windowStatement,
  optionalRecommendedWhitespace,
  asAlias,
  whitespace,
  overStatement,
}: {
  asAlias: string;
  optionalRecommendedWhitespace: string,
  columnNames: string
  windowStatement: string;
  whitespace: string;
  overStatement: string;
}): string => {
  const possibleColumnsWithOver = any(
    possibleColumnNames,
    windowStatement,
    rule(
      any(possibleColumnNames, windowStatement),
      whitespace,
      overStatement,
    ),
  );
  const possibleColumnsWithAlias = any(
    possibleColumnsWithOver,
    rule(
      possibleColumnsWithOver,
      opt(whitespace, asAlias),
    ),
  );
  return join(
    possibleColumnsWithAlias,
    star(
      COMMA_KEY,
      optionalRecommendedWhitespace,
      possibleColumnsWithAlias,
    ),
  );
};
