import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";

export const getJoinCondition = ({
  ws,
  optNonRecWS,
  whereClauseInner,
}: {
  ws: GBNFRule;
  optNonRecWS: GBNFRule | undefined;
  whereClauseInner: GBNFRule;
}): GBNFRule => {
  const equijoinConditions = _`
    ${whereClauseInner}
    ${_`
      ${ws}
      ${_`
        ${$`AND`}
        | ${$`OR`}
      `}
      ${ws}
      ${whereClauseInner}
    `.wrap('*')}
  `;
  return _`
  ${_`
    "("
      ${optNonRecWS}
      ${equijoinConditions}
      ${optNonRecWS}
    ")"
  `}
  | ${equijoinConditions}
  `;
};
