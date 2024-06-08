import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder";
import { getTableWithAlias, tableName, } from "../constants.js";

export const getSelectQuery = ({
  whereClause,
  orderByClause,
  limitClause,
  joinClause,
  groupByClause,
  havingClause,

  projection,
  optionalRecommendedWhitespace,
  ws,
}: {
  whereClause: GBNFRule;
  orderByClause: GBNFRule;
  limitClause: GBNFRule;
  joinClause: GBNFRule;
  groupByClause: GBNFRule;
  havingClause: GBNFRule;

  projection: GBNFRule;
  optionalRecommendedWhitespace: GBNFRule | undefined;
  ws: GBNFRule;
}): GBNFRule => {
  const projectionOrStar = _` ${projection} | "*" `;
  const intoClause = _`
    ${$`INTO`} 
    ${ws} 
    ${tableName} 
    ${ws}
  `;
  const tableWithAlias = getTableWithAlias(ws);
  const selectlist = _`
    ${_`
      ${_`
        ${projectionOrStar} 
        ${ws} 
        ${intoClause.wrap('?')}
      `}
      | ${_`
          ${intoClause.wrap('?')} 
          ${projectionOrStar} 
          ${ws}
        `}
    `}
    ${$`FROM`}
    ${ws}
    ${tableWithAlias}
    ${_`
      ","
      ${optionalRecommendedWhitespace}
      ${tableWithAlias}
    `.wrap('*')}
  `;

  return _`
  ${$`SELECT`}
  ${ws}
  ${_`${$`DISTINCT`} ${ws}`.wrap('?')}
  ${selectlist}
  ${_`${ws} ${joinClause}`.wrap('*')}
  ${_`${whereClause.wrap('?')}`}
  ${_`${groupByClause.wrap('?')}`}
  ${_`${havingClause.wrap('?')}`}
  ${_`${orderByClause.wrap('?')}`}
  ${_`${limitClause.wrap('?')}`}
`;

};
