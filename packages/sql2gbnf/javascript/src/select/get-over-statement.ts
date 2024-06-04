import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";

export const getOverStatement = ({
  validName,
  positiveInteger,
  optionalRecommendedWhitespace: optionalRecommendedWS,
  whitespace: ws,
  // optionalNonRecommendedWhitespace: optionalNonRecommendedWS,
  direction,
}: {
  direction: GBNFRule;
  optionalRecommendedWhitespace: GBNFRule | undefined;
  validName: GBNFRule;
  positiveInteger: GBNFRule;
  whitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
}): GBNFRule => {
  const unit = _` ${$`DAY`} | ${$`MONTH`} | ${$`YEAR`} | ${$`HOUR`} | ${$`MINUTE`} | ${$`SECOND`} `;
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
  const orderStmt = _`${$`ORDER BY`} ${ws} ${validName} ${direction.wrap('?')}`;
  const partitionByStmt = _`${$`PARTITION BY`} ${ws} ${validName}`;

  return _`${$`OVER`} ${optionalRecommendedWS} "(" 
    ${_`
      ${partitionByStmt}
      | ${orderStmt}
      | ${_`${partitionByStmt} ${ws} ${orderStmt}`}
    `.wrap('?')}
    ${rangeOrBetween.wrap('?')}
  ")"`;
};
