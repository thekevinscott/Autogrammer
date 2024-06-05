import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import {
  validAlias,
  tableName,
} from "../constants.js";
import {
  getJoinCondition,
} from './get-join-condition.js';

export const getJoinClause = ({
  ws,
  optNonRecWS,
  whereClauseInner,
}: {
  ws: GBNFRule;
  optNonRecWS: GBNFRule | undefined;
  whereClauseInner: GBNFRule;
}) => {
  const joinCondition = getJoinCondition({
    ws,
    optNonRecWS,
    whereClauseInner,
  });
  const rule = _` 
    ${_`
      ${_`
        ${$`LEFT`}
        | ${$`RIGHT`}
        | ${$`FULL`}
      `}
      ${ws}
    `.wrap('?')}
    ${_`
      ${_`
        ${$`INNER`}
        | ${$`OUTER`}
      `}
      ${ws}
    `.wrap('?')}
    ${$`JOIN`} 
    ${ws} 
    ${tableName}
    ${_`${ws} ${validAlias}`.wrap('?')}
    ${ws} 
    ${$`ON`} 
    ${ws} 
    ${joinCondition} 
  `;
  return rule;
};
