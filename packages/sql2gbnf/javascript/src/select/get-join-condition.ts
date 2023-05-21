import { join, } from "gbnf";
import { rule, } from "./get-rule.js";
import { star, } from "./get-star.js";
import { any, } from "../utils/any.js";

// export const getEquijoinCondition = ({
//   tableName,
//   optionalRecommendedWhitespace,
//   // validColName,
//   // quote,
//   whereClauseInner,
// }: {
//   optionalRecommendedWhitespace: string;
//   tableName: string;
//   // validColName: string;
//   // quote: string;
//   whereClauseInner: string;
// }) => {
//   return whereClauseInner;
//   // return join(
//   //   tableName,
//   //   optionalRecommendedWhitespace,
//   //   '"="',
//   //   optionalRecommendedWhitespace,
//   //   '"T2.id"',
//   //   // whereClauseInner,
//   // );
// };

export const getJoinCondition = ({
  whitespace,
  and,
  or,
  // optionalRecommendedWhitespace,
  optionalNonRecommendedWhitespace,
  leftParen,
  rightParen,
  equijoinCondition,
}: {
  whitespace: string;
  and: string;
  or: string;
  optionalRecommendedWhitespace: string;
  optionalNonRecommendedWhitespace: string;
  leftParen: string;
  rightParen: string;
  equijoinCondition: string;
}) => {
  const equijoinConditions = rule(
    equijoinCondition,
    star(
      whitespace,
      any(and, or),
      whitespace,
      equijoinCondition,
    ),
  );
  return any(
    rule(
      leftParen,
      optionalNonRecommendedWhitespace,
      equijoinConditions,
      optionalNonRecommendedWhitespace,
      rightParen,
    ),
    equijoinConditions,
  );
};
