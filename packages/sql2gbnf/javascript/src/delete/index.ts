import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import { getJoinClause, } from "../join/get-join-clause.js";
import { getWhereClauseInner, } from "../select/get-where-clause-inner.js";
import {
  getTableWithAlias,
} from "../constants.js";
import {
  getWhereClause,
} from '../where/get-where-clause.js';
import { getOrderByClause, } from "../order/get-order-by-clause.js";
import { getLimitClause, } from "../limit/index.js";

export const getDeleteRule = ({
  optionalRecommendedWhitespace: optRecWS,
  optionalNonRecommendedWhitespace: optNonRecWS,
  mandatoryWhitespace: ws,
}: {
  optionalRecommendedWhitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  mandatoryWhitespace: GBNFRule;
}
): GBNFRule => {
  const whereClauseInner = getWhereClauseInner({
    optRecWS,
    ws,
    optNonRecWS,
  });

  const tableWithAlias = getTableWithAlias(ws);

  return _`
    ${$`DELETE`}
    ${ws}
    ${$`FROM`}
    ${ws}
    ${tableWithAlias}
    ${_`
      ${ws}
      ${$`USING`} 
      ${ws} 
      ${tableWithAlias}
    `.wrap('?')}
    ${_`
      ${ws}
      ${getJoinClause({ ws, optNonRecWS, whereClauseInner, })}
    `.wrap('?')}
    ${getWhereClause({ ws, whereClauseInner, }).wrap('?')}
    ${getOrderByClause({ ws, optRecWS, optNonRecWS, }).wrap('?')}
    ${getLimitClause({ ws, optRecWS, }).wrap('?')}
    ${ws}
  `;
};

