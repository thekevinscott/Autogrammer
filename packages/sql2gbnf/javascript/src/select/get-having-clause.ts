import {
  join,
  joinPipe,
} from "gbnf";
import { rule, } from "./get-rule.js";
import { opt, } from "./get-optional.js";

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
}) => join(
  ws,
  having,
  ws,
  validColName,
  rule(joinPipe(
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
      rule(joinPipe(
        number,
        string,
      ))
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
      rule(joinPipe(string, boolean, number)),
    ),
  ))
);
