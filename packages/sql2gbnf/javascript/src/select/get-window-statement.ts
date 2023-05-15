import {
  join,
  joinPipe,
} from "gbnf";
import { rule, } from "./get-rule.js";
import { opt, } from "./get-optional.js";
import {
  LEFT_PAREN_KEY,
  RIGHT_PAREN_KEY,
} from "../constants/grammar-keys.js";

export const getWindowStatement = ({
  rank,
  denserank,
  rownumber,
  overStatement,
  alias,
  colName,
  comma,
  positiveInteger,
  lead,
  lag,
  optionalRecommendedWhitespace,
  whitespace: ws,
  optionalNonRecommendedWhitespace,
}: {
  optionalNonRecommendedWhitespace: string;
  whitespace: string,
  optionalRecommendedWhitespace: string,
  rank: string;
  denserank: string;
  rownumber: string;
  overStatement: string;
  alias: string;
  colName: string;
  comma: string;
  positiveInteger: string;
  lead: string;
  lag: string;
}) => join(
  rule(joinPipe(
    rule(
      rule(joinPipe(
        rank,
        denserank,
        rownumber,
      )),
      `"()"`,
    ),
    rule(
      rule(joinPipe(
        lead,
        lag,
      )),
      LEFT_PAREN_KEY,
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
      RIGHT_PAREN_KEY,
    ),
  )),
  ws,
  overStatement,
  alias,
);
