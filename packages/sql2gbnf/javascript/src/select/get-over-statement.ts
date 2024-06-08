import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder";
import {
  getDirection,
  unit,
  positiveInteger,
  columnName,
} from '../constants.js';

export const getOverStatement = ({
  optionalRecommendedWhitespace: optionalRecommendedWS,
  whitespace: ws,
  // optionalNonRecommendedWhitespace: optionalNonRecommendedWS,
}: {
  optionalRecommendedWhitespace: GBNFRule | undefined;
  whitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
}): GBNFRule => {
  const direction = getDirection(ws);
  const rangeClause = (modifier: GBNFRule) => _`
  ${_`
    ${$`INTERVAL`}
    ${ws}
    ${_`
      ${_`
        "'" 
        ${positiveInteger} 
        "'" 
        ${ws} 
        ${unit}
      `}
      | ${_`
        "'" 
        ${positiveInteger} 
        "-" 
        ${positiveInteger} 
        "'" 
        ${ws} 
        ${unit} 
        ${ws} 
        ${$`TO`} 
        ${ws} 
        ${unit}
      `}
    `}
    ${_`${ws} ${modifier}`.wrap('?')}
  `}
  | ${_`
      ${$`UNBOUNDED`} 
      ${ws} 
      ${modifier}
    `}
  | ${$`CURRENT ROW`} 
  | ${_`
      ${positiveInteger} 
      ${ws} 
      ${modifier}
    `} `;

  const rangeRule = _` ${$`RANGE BETWEEN`} ${ws} ${rangeClause($`PRECEDING`)} ${ws} ${$`AND`} ${ws} ${rangeClause($`FOLLOWING`)} `;

  const btwnClause = (modifier: GBNFRule) => _` 
    ${_`${$`UNBOUNDED`} ${ws} ${modifier}`} 
    | ${$`CURRENT ROW`} 
    | ${_`${positiveInteger} ${ws} ${modifier}`}
    `;
  const betweenRule = _` ${$`ROWS BETWEEN`} ${ws} ${btwnClause($`PRECEDING`)} ${ws} ${$`AND`} ${ws} ${btwnClause($`FOLLOWING`)} `;

  const rangeOrBetween = _`${ws} ${_`${rangeRule} | ${betweenRule}`}`;
  const orderStmt = _`${$`ORDER BY`} ${ws} ${columnName} ${direction.wrap('?')}`;
  const partitionByStmt = _`${$`PARTITION BY`} ${ws} ${columnName}`;

  return _`${$`OVER`} ${optionalRecommendedWS} "(" 
    ${_`
      ${partitionByStmt}
      | ${orderStmt}
      | ${_`${partitionByStmt} ${ws} ${orderStmt}`}
    `.wrap('?')}
    ${rangeOrBetween.wrap('?')}
  ")"`;
};
