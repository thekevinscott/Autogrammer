import {
  join,
} from "gbnf/builder";
import { rule, } from "../utils/get-rule.js";
import { opt, } from "../utils/get-optional.js";
import { any, } from "../utils/any.js";

export const getWindowStatement = ({
  rank,
  denserank,
  rownumber,
  colName,
  comma,
  positiveInteger,
  lead,
  lag,
  optionalRecommendedWhitespace,
  // whitespace: ws,
  optionalNonRecommendedWhitespace,
  leftparen,
  rightparen,
}: {
  optionalNonRecommendedWhitespace: string;
  whitespace: string,
  optionalRecommendedWhitespace: string,
  rank: string;
  denserank: string;
  rownumber: string;
  colName: string;
  comma: string;
  positiveInteger: string;
  lead: string;
  lag: string;
  leftparen: string;
  rightparen: string;
}) => join(
  any(
    rule(
      any(
        rank,
        denserank,
        rownumber,
      ),
      `"()"`,
    ),
    rule(
      any(
        lead,
        lag,
      ),
      leftparen,
      optionalNonRecommendedWhitespace,
      colName,
      comma,
      optionalRecommendedWhitespace,
      positiveInteger,
      opt(
        comma,
        optionalRecommendedWhitespace,
        positiveInteger,
      ),
      optionalNonRecommendedWhitespace,
      rightparen,
    ),
  ),
);
