import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";

export const getJoinClause = ({
  tableWithOptionalAlias,
  whitespace: ws,
  joinCondition,
}: {
  whitespace: GBNFRule | undefined;
  tableWithOptionalAlias: GBNFRule;
  joinCondition: GBNFRule;
}) => _` 
  ${_`
    ${_`${$`INNER`} ${ws}`.wrap('?')}
    ${_`${$`LEFT`} ${ws}`.wrap('?')}
    ${_`${$`RIGHT`} ${ws}`.wrap('?')}
    ${_`
      ${_`${$`FULL`} ${ws}`.wrap('?')}
      ${_`${$`OUTER`} ${ws}`.wrap('?')}
    `}
  `.wrap('?')}
  ${$`JOIN`} 
  ${ws} 
  ${tableWithOptionalAlias} 
  ${ws} 
  ${$`ON`} 
  ${ws} 
  ${joinCondition} 
`;
