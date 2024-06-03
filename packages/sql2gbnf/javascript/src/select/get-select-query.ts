import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";

export const getSelectQuery = ({
  whereClause,
  orderByClause,
  limitClause,
  joinClause,
  groupByClause,
  havingClause,

  validTableName,
  projection,
  optionalRecommendedWhitespace,
  // selectTables,
  table,
  // database,
  whitespace,
}: {
  whereClause: GBNFRule;
  orderByClause: GBNFRule;
  limitClause: GBNFRule;
  joinClause: GBNFRule;
  groupByClause: GBNFRule;
  havingClause: GBNFRule;

  projection: GBNFRule;
  optionalRecommendedWhitespace: GBNFRule | undefined;

  validTableName: GBNFRule;
  // selectTables: string;
  table: GBNFRule;
  whitespace: GBNFRule | undefined;
}): GBNFRule => {
  const projectionOrStar = _` ${projection} | "*" `;
  const intoClause = _` ${$`INTO`} ${whitespace} ${validTableName} ${whitespace} `;
  const selectlist = _`
  ${_`
    ${_`${projectionOrStar} ${whitespace} ${intoClause.wrap('?')}`}
    | ${_`${intoClause.wrap('?')} ${projectionOrStar} ${whitespace}`}
  `}
  ${$`FROM`}
  ${whitespace}
  ${table}
  ${_`
    ","
    ${optionalRecommendedWhitespace}
    ${table}
  `.wrap('*')}
`;

  return _`
  ${$`SELECT`}
  ${whitespace}
  ${_`${$`DISTINCT`} ${whitespace}`.wrap('?')}
  ${selectlist}
  ${_`${whitespace} ${joinClause}`.wrap('*')}
  ${_`${whereClause.wrap('?')}`}
  ${_`${groupByClause.wrap('?')}`}
  ${_`${havingClause.wrap('?')}`}
  ${_`${orderByClause.wrap('?')}`}
  ${_`${limitClause.wrap('?')}`}
`;

};
