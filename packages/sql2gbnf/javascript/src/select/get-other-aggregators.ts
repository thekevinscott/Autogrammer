import {
  join,
} from "gbnf";
import { star, } from "../utils/get-star.js";
import { opt, } from "../utils/get-optional.js";

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

