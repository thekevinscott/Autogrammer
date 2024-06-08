import { getJoinClause, } from "../join/get-join-clause.js";
import { getSelectQuery, } from "./get-select-query.js";
import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import { getOverStatement, } from "./get-over-statement.js";
import { getWindowStatement, } from "./get-window-statement.js";
import { getWhereClauseInner, } from "./get-where-clause-inner.js";
import {
  getAsAlias,
  getEqualOps,
  stringWithQuotes,
  numericOps,
  number,
  boolean,
  getColumnNames,
} from "../constants.js";
import { getWhereClause, } from "../where/get-where-clause.js";
import { getOrderByClause, } from "../order/get-order-by-clause.js";
import { FULL_SELECT_QUERY, } from "../keys.js";
import { getLimitClause, } from "../limit/index.js";

export const getSelectRule = ({
  optRecWS,
  optNonRecWS,
  ws,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  singleColumn = false,
}: {
  optRecWS: GBNFRule | undefined;
  optNonRecWS: GBNFRule | undefined;
  ws: GBNFRule;
  singleColumn?: boolean;
}
): GBNFRule => {
  const equalOps = getEqualOps(ws);
  const asAlias = getAsAlias(ws);
  const columnNames = getColumnNames({
    ws,
    optNonRecWS,
    optRecWS,
  });

  const whereClauseInner = getWhereClauseInner({
    optRecWS,
    ws,
    optNonRecWS,
  });

  const windowStatement = getWindowStatement({
    optionalRecommendedWhitespace: optRecWS,
    optionalNonRecommendedWhitespace: optNonRecWS,
  });

  const overStatement = getOverStatement({
    optionalRecommendedWhitespace: optRecWS,
    optionalNonRecommendedWhitespace: optNonRecWS,
    whitespace: ws,
  });

  const possibleColumnsWithOver = _` 
  ${columnNames} 
  | ${windowStatement} 
  | ${_` 
      ${_`${columnNames} | ${windowStatement}`} 
      ${ws} 
      ${overStatement} `} 
  `;
  const possibleColsWithAlias = _` 
    ${possibleColumnsWithOver} 
    | ${_`
      ${possibleColumnsWithOver} 
      ${_`
        ${ws} 
        ${asAlias}
      `.wrap('?')
      }`
    }`;
  const projection = _`
    ${possibleColsWithAlias} 
    ${_`
      "," 
      ${optRecWS} 
      ${possibleColsWithAlias}
    `.wrap('*')
    }`;

  return getSelectQuery({
    joinClause: getJoinClause({
      ws,
      optNonRecWS,
      whereClauseInner,
    }),
    limitClause: getLimitClause({
      ws,
      optRecWS,
    }),
    orderByClause: getOrderByClause({
      ws,
      optNonRecWS,
      optRecWS,
    }),
    groupByClause: _`
      ${ws} 
      ${$`GROUP BY`}
      ${ws}
      ${columnNames}
      ${_`${ws} ${asAlias}`.wrap('?')}
      ${_`"," ${optRecWS} ${columnNames}`.wrap('*')}
    `,
    whereClause: getWhereClause({
      ws,
      whereClauseInner,
    }),
    havingClause: _`
      ${ws}
      ${$`HAVING`}
      ${ws}
      ${columnNames}
      ${_`${ws} ${asAlias}`.wrap('?')}
      (
        ${_`
          ${ws} 
          ${$`IS`} 
          ${ws} 
          ${_`${$`NOT`} ${ws}`.wrap('?')} 
          ${$`NULL`}
        `}
        | ${_`
          ${optRecWS} 
          ${numericOps} 
          ${optRecWS} 
          ${_`
            ${number} 
            | ${stringWithQuotes}
          `}
        `}
        | ${_`${ws} ${$`LIKE`} ${ws} ${stringWithQuotes}`}
        | ${_`
          ${optRecWS} 
          ${equalOps} 
          ${optRecWS} 
          ${_`
            ${stringWithQuotes} 
            | ${boolean} 
            | ${number}
          `}
        `}
      )
    `,
    projection,
    optionalRecommendedWhitespace: optRecWS,
    ws: ws,
  }).key(FULL_SELECT_QUERY);
};


