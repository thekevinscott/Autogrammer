import {
  join,
} from "gbnf";
import { rule, } from "../utils/get-rule.js";
import { star, } from "../utils/get-star.js";
import { opt, } from "../utils/get-optional.js";
import { any, } from "../utils/any.js";

export const getCountAggregator = ({
  countAggregator,
  arithmeticOps,
  validName,
  optionalNonRecommendedWhitespace,
  optionalRecommendedWhitespace,
  leftParen,
  rightParen,
  distinct,
  whitespace,
}: {
  optionalNonRecommendedWhitespace: string;
  optionalRecommendedWhitespace: string;
  arithmeticOps: string;
  countAggregator: string;
  validName: string;
  leftParen: string;
  rightParen: string;
  distinct: string;
  whitespace: string;
}) => join(
  countAggregator,
  leftParen,
  optionalNonRecommendedWhitespace,
  any(
    '"*"',
    rule(
      opt(distinct, whitespace),
      validName,
      star(
        optionalRecommendedWhitespace,
        arithmeticOps,
        optionalRecommendedWhitespace,
        validName,
      ),
    ),
  ),
  optionalNonRecommendedWhitespace,
  rightParen,
);
