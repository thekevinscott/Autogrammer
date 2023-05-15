import {
  join,
  joinPipe,
} from "gbnf";
import { rule, } from "./get-rule.js";
import { LEFT_PAREN_KEY, RIGHT_PAREN_KEY, } from "../constants/grammar-keys.js";
import { star, } from "./get-star.js";
import { opt, } from "./get-optional.js";

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
}) => {
  const unit = rule(joinPipe(
    day,
    month,
    year,
    hour,
    minute,
    second,
  ));
  const intervalRule = (post: string) => rule(
    interval,
    mandatoryWS,
    rule(joinPipe(
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
    )),
    opt(mandatoryWS, post),
  );
  const rangeRule = rule(
    rangeBetween,
    mandatoryWS,
    rule(joinPipe(
      intervalRule(preceding),
      rule(unbounded, mandatoryWS, preceding),
      currentRow,
      rule(positiveInteger, mandatoryWS, preceding),
    )),
    mandatoryWS,
    and,
    mandatoryWS,
    rule(joinPipe(
      intervalRule(following),
      rule(unbounded, mandatoryWS, following),
      currentRow,
      rule(positiveInteger, mandatoryWS, following),
    )),
  );

  const betweenRule = rule(
    rowsBetween,
    mandatoryWS,
    rule(joinPipe(
      rule(unbounded, mandatoryWS, preceding),
      currentRow,
      rule(positiveInteger, mandatoryWS, preceding),
    )),
    mandatoryWS,
    and,
    mandatoryWS,
    rule(joinPipe(
      rule(unbounded, mandatoryWS, following),
      currentRow,
      rule(positiveInteger, mandatoryWS, following),
    )),
  );
  return join(
    over,
    optionalRecommendedWS,
    LEFT_PAREN_KEY,
    optionalNonRecommendedWS,
    opt(
      rule(joinPipe(
        rule(
          order,
          mandatoryWS,
          validName,
          opt(mandatoryWS, direction),
        ),
        rule(partition, mandatoryWS, validName),
      )),
      opt(
        mandatoryWS,
        rule(joinPipe(
          rangeRule,
          betweenRule,
        )),
      ),
      star(
        mandatoryWS,
        rule(joinPipe(
          rule(
            order,
            mandatoryWS,
            validName,
            opt(mandatoryWS, direction),
          ),
          rule(partition, mandatoryWS, validName),
        )),
        opt(
          mandatoryWS,
          rule(joinPipe(
            rangeRule,
            betweenRule,
          )),
        ),
      ),
    ),
    optionalNonRecommendedWS,
    RIGHT_PAREN_KEY,
  );
};
