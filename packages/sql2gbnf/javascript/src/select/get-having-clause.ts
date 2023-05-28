import {
  join,
} from "gbnf";
import { rule, } from "../utils/get-rule.js";
import { opt, } from "../utils/get-optional.js";
import { any, } from "../utils/any.js";

export const getHavingClause = ({
  numericOps,
  stringOps,
  equalOps,
  having,
  validColName,
  number,
  string,
  is,
  not,
  nullKey,
  stringWildcard,
  boolean,
  optionalRecommendedWhitespace,
  // optionalNonRecommendedWhitespace,
  whitespace: ws,
  asAlias,
}: {
  whitespace: string;
  optionalRecommendedWhitespace: string;
  optionalNonRecommendedWhitespace: string;
  numericOps: string;
  stringOps: string;
  equalOps: string;
  having: string;
  validColName: string;
  number: string;
  string: string;
  is: string;
  not: string;
  nullKey: string;
  stringWildcard: string;
  boolean: string;
  asAlias: string;
}) => join(
  ws,
  having,
  ws,
  validColName,
  opt(ws, asAlias),
  any(
    rule(
      ws,
      is,
      opt(ws, not,),
      ws,
      nullKey,
    ),
    rule(
      optionalRecommendedWhitespace,
      numericOps,
      optionalRecommendedWhitespace,
      any(
        number,
        string,
      )
    ),
    rule(
      ws,
      stringOps,
      ws,
      stringWildcard,
    ),
    rule(
      optionalRecommendedWhitespace,
      equalOps,
      optionalRecommendedWhitespace,
      any(string, boolean, number),
    ),
  )
);
