import {
  join,
} from "gbnf/builder-v1";
import { rule, } from "../utils/get-rule.js";
import { star, } from "../utils/get-star.js";
import { opt, } from "../utils/get-optional.js";
import { any, } from "../utils/any.js";

export const getOverStatement = ({
  over,
  order,
  partition,
  validName,
  rowsBetween,
  currentRow,
  unbounded,
  preceding,
  following,
  and,
  positiveInteger,
  direction,
  rangeBetween,
  interval,
  month,
  year,
  day,
  hour,
  minute,
  second,
  singleQuote,
  to,
  optionalRecommendedWhitespace: optionalRecommendedWS,
  whitespace: mandatoryWS,
  optionalNonRecommendedWhitespace: optionalNonRecommendedWS,
  leftparen,
  rightparen,
}: {
  optionalRecommendedWhitespace: string;
  over: string;
  order: string;
  partition: string;
  validName: string;
  rowsBetween: string;
  currentRow: string;
  unbounded: string;
  preceding: string;
  following: string;
  and: string;
  positiveInteger: string;
  direction: string;
  rangeBetween: string;
  interval: string;
  month: string;
  year: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  singleQuote: string;
  to: string;
  whitespace: string;
  optionalNonRecommendedWhitespace: string;
  leftparen: string;
  rightparen: string;
}) => {
  const unit = any(
    day,
    month,
    year,
    hour,
    minute,
    second,
  );
  const intervalRule = (post: string) => rule(
    interval,
    mandatoryWS,
    any(
      rule(
        singleQuote,
        positiveInteger,
        singleQuote,
        mandatoryWS,
        unit,
      ),
      rule(
        singleQuote,
        positiveInteger,
        '"-"',
        positiveInteger,
        singleQuote,
        mandatoryWS,
        unit,
        mandatoryWS,
        to,
        mandatoryWS,
        unit,
      ),
    ),
    opt(mandatoryWS, post),
  );
  const rangeRule = rule(
    rangeBetween,
    mandatoryWS,
    any(
      intervalRule(preceding),
      rule(unbounded, mandatoryWS, preceding),
      currentRow,
      rule(positiveInteger, mandatoryWS, preceding),
    ),
    mandatoryWS,
    and,
    mandatoryWS,
    any(
      intervalRule(following),
      rule(unbounded, mandatoryWS, following),
      currentRow,
      rule(positiveInteger, mandatoryWS, following),
    ),
  );

  const betweenRule = rule(
    rowsBetween,
    mandatoryWS,
    any(
      rule(unbounded, mandatoryWS, preceding),
      currentRow,
      rule(positiveInteger, mandatoryWS, preceding),
    ),
    mandatoryWS,
    and,
    mandatoryWS,
    any(
      rule(unbounded, mandatoryWS, following),
      currentRow,
      rule(positiveInteger, mandatoryWS, following),
    ),
  );
  return join(
    over,
    optionalRecommendedWS,
    leftparen,
    optionalNonRecommendedWS,
    opt(
      any(
        rule(
          order,
          mandatoryWS,
          validName,
          opt(mandatoryWS, direction),
        ),
        rule(partition, mandatoryWS, validName),
      ),
      opt(
        mandatoryWS,
        any(
          rangeRule,
          betweenRule,
        ),
      ),
      star(
        mandatoryWS,
        any(
          rule(
            order,
            mandatoryWS,
            validName,
            opt(mandatoryWS, direction),
          ),
          rule(partition, mandatoryWS, validName),
        ),
        opt(
          mandatoryWS,
          any(
            rangeRule,
            betweenRule,
          ),
        ),
      ),
    ),
    optionalNonRecommendedWS,
    rightparen,
  );
};
