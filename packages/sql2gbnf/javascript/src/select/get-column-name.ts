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

export const getColumnName = ({
  aggregatorOps,
  countAggregator,
  arithmeticOps,
  validName,
  asAlias,
  overStatement,
  whitespace: ws,
  optionalNonRecommendedWhitespace,
  optionalRecommendedWhitespace,
}: {
  optionalNonRecommendedWhitespace: string;
  optionalRecommendedWhitespace: string;
  whitespace: string;
  arithmeticOps: string;
  countAggregator: string;
  aggregatorOps: string;
  validName: string;
  asAlias: string;
  overStatement?: string;
}) => join(...[
  rule(joinPipe(
    validName,

    rule(joinPipe(
      rule(
        countAggregator,
        LEFT_PAREN_KEY,
        optionalNonRecommendedWhitespace,
        rule(joinPipe(
          rule(
            optionalNonRecommendedWhitespace,
            '"*"',
            optionalNonRecommendedWhitespace,
          ),
          rule(
            validName,
            star(
              optionalRecommendedWhitespace,
              arithmeticOps,
              optionalRecommendedWhitespace,
              validName,
            ),
          ),
        )),
        optionalNonRecommendedWhitespace,
        RIGHT_PAREN_KEY,
      ),
      rule(
        aggregatorOps,
        LEFT_PAREN_KEY,
        optionalNonRecommendedWhitespace,
        validName,
        star(
          optionalRecommendedWhitespace,
          arithmeticOps,
          optionalRecommendedWhitespace,
          validName,
        ),
        optionalNonRecommendedWhitespace,
        RIGHT_PAREN_KEY,
      ),
    )),
  )),
  overStatement ? opt(ws, overStatement) : undefined,
  asAlias,
].filter(Boolean));

