import {
  join,
  joinPipe,
} from "gbnf";
import {
  LEFT_PAREN_KEY,
  RIGHT_PAREN_KEY,
} from "../constants/grammar-keys.js";
import { rule, } from "./get-rule.js";
import { star, } from "./get-star.js";
import { opt, } from "./get-optional.js";
import { any, } from "../utils/any.js";

export const getOtherAggregators = ({
  aggregatorOps,
  arithmeticOps,
  validName,
  whitespace: ws,
  optionalNonRecommendedWhitespace,
  optionalRecommendedWhitespace,
  leftParen,
  rightParen,
  distinct,
}: {
  leftParen: string,
  rightParen: string,
  optionalNonRecommendedWhitespace: string;
  optionalRecommendedWhitespace: string;
  whitespace: string;
  arithmeticOps: string;
  aggregatorOps: string;
  validName: string;
  distinct: string;
}) => join(
  aggregatorOps,
  leftParen,
  optionalNonRecommendedWhitespace,
  opt(distinct, ws),
  validName,
  star(
    optionalRecommendedWhitespace,
    arithmeticOps,
    optionalRecommendedWhitespace,
    validName,
  ),
  optionalNonRecommendedWhitespace,
  rightParen,
);

