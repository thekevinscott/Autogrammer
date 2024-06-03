import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";

export const getJoinCondition = ({
  whitespace,
  optionalNonRecommendedWhitespace,
  equijoinCondition,
}: {
  whitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  equijoinCondition: GBNFRule;
}): GBNFRule => {
  const equijoinConditions = _`
    ${equijoinCondition}
    ${_`
      ${whitespace}
      ${_`
        ${$`AND`}
        | ${$`OR`}
      `}
      ${whitespace}
      ${equijoinCondition}
    `.wrap('*')}
  `;
  return _`
  ${_`
    "("
      ${optionalNonRecommendedWhitespace}
      ${equijoinConditions}
      ${optionalNonRecommendedWhitespace}
    ")"
  `}
  | ${equijoinConditions}
  `;
};
