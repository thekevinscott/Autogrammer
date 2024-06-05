import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import { getJoinClause, } from "../join/get-join-clause.js";
import { getJoinCondition, } from "../join/get-join-condition.js";
import { getWhereClauseInner, } from "../select/get-where-clause-inner.js";

export const getDeleteRule = ({
  number,
  stringWithQuotes,
  optionalRecommendedWhitespace: optRecWS,
  optionalNonRecommendedWhitespace: optNonRecWS,
  mandatoryWhitespace: ws,
  validFullName,
  boolean,
  positiveInteger,
  equalOps,
  arithmeticOps,
  numericOps,
}: {
  boolean: GBNFRule;
  number: GBNFRule,
  stringWithQuotes: GBNFRule;
  optionalRecommendedWhitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  mandatoryWhitespace: GBNFRule | undefined;
  validFullName: GBNFRule;
  positiveInteger: GBNFRule;
  equalOps: GBNFRule;
  arithmeticOps: GBNFRule;
  numericOps: GBNFRule;
}
): GBNFRule => {
  const tableName = _`
    ${validFullName}
    ${_`${ws} ${validFullName}`.wrap('?')}
  `;
  const whereClauseInner = getWhereClauseInner({
    equalOps,
    numericOps,
    positiveInteger,
    validFullName,
    optRecWS,
    stringWithQuotes,
    number,
    ws,
    optNonRecWS,
  });
  return _`
    ${$`DELETE`}
    ${ws}
    ${$`FROM`}
    ${ws}
    ${tableName}
    ${ws}
    ${_`${$`USING`} ${ws} ${tableName}`.wrap('?')}
    ${getJoinClause({
    tableWithOptionalAlias: tableName,
    whitespace: ws,
    joinCondition: getJoinCondition({
      optionalNonRecommendedWhitespace: optNonRecWS,
      equijoinCondition: whereClauseInner,
      whitespace: ws,
    }),
  }).wrap('?')}
  `;
};

