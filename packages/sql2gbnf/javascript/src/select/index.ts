import { getJoinClause, } from "./get-join-clause.js";
import { getSelectQuery, } from "./get-select-query.js";
import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import { getOverStatement, } from "./get-over-statement.js";
import { getWindowStatement, } from "./get-window-statement.js";
import { getJoinCondition, } from "./get-join-condition.js";

export const select = ({
  boolean,
  stringWithQuotes,
  optionalRecommendedWhitespace: optRecWS,
  optionalNonRecommendedWhitespace: optNonRecWS,
  mandatoryWhitespace: ws,
  validFullName,
  withUnion = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  singleColumn = false,
  number,
}: {
  boolean: GBNFRule;
  number: GBNFRule;
  stringWithQuotes: GBNFRule;
  optionalRecommendedWhitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  mandatoryWhitespace: GBNFRule | undefined;
  validFullName: GBNFRule;
  withUnion?: boolean;
  singleColumn?: boolean;
}
): GBNFRule => {
  const positiveInteger = _`[0-9] | [1-9] [0-9]*`.wrap("?");
  const equalOps = _`
    "=" 
    | "!=" 
    | ${_`
      ${$`IS`} 
      ${ws} 
      ${_`
        ${$`NOT`} 
        ${ws}
        `.wrap('?')}
      `}
  `;
  const arithmeticOps = _`"+" | "-" | "*" | "/"`;
  const numericOps = _`">" | "<" | ">=" | "<="`;
  const asAlias = _`${$`AS`} ${ws} ${validFullName}`;
  const columnNames = _`
    ${validFullName}
    | ${_`
        ${_`
          ${$`MIN`} 
          | ${$`MAX`} 
          | ${$`AVG`} 
          | ${$`SUM`}
        `.wrap()}
        "("
          ${optNonRecWS}
          ${_`
            ${$`DISTINCT`} 
            ${ws}
          `.wrap('?')}
          ${validFullName}
          ${_`
            ${optRecWS}
            ${arithmeticOps}
            ${optRecWS}
            ${validFullName}
            ${optRecWS}
          `.wrap('*')}
          ${optNonRecWS}
        ")"
      `}
    | ${_`
        ${$`COUNT`}
        ${optNonRecWS}
        ${$`(`}
        ${optNonRecWS}
        ${_`
          ${$`*`}
          | ${_`
              ${_`
                ${$`DISTINCT`} 
                ${ws}
              `.wrap('?')}
              ${validFullName}
              ${_`
                ${optRecWS}
                ${arithmeticOps}
                ${optRecWS}
                ${validFullName}
              `.wrap('*')}
          `}
        `}
        ${optNonRecWS}
        ${$`)`}
      `}
  `;
  const tableName = _`${validFullName} ${_`${ws} ${validFullName}`.wrap('?')}`;

  const dateDef = _` "'" [0-9] [0-9] [0-9] [0-9] "-" [0-9] [0-9] "-" [0-9] [0-9] "'" `;
  const whereClauseInner = _`
  ${validFullName}
  ${_`
    ${_`
      ${optRecWS} 
      ${equalOps}
      ${optRecWS}
      ${_`
        ${validFullName}
        | ${positiveInteger}
        | ${stringWithQuotes}
      `}
    `}
    | ${_`
      ${optRecWS} 
      ${numericOps}
      ${optRecWS}
      ${_` ${number} | ${dateDef} `}
    `}
    | ${_`
      ${optRecWS} 
      ${$`LIKE`}
      ${optRecWS}
      ${stringWithQuotes}
    `}
    | ${_`
      ${optRecWS} 
      ${$`BETWEEN`}
      ${ws}
      ${_`
        ${_` ${number} ${ws} ${$`AND`} ${ws} ${number} `}
        | ${_` ${stringWithQuotes} ${ws} ${$`AND`} ${ws} ${stringWithQuotes} `}
      `}
    `}
    |
    ${_`
      ${ws} 
      ${$`IN`}
      ${ws}
      "("
        ${optRecWS}
        ${stringWithQuotes}
        ${_`
          ","
          ${optRecWS}
          ${stringWithQuotes}
        `.wrap('*')}
        ${optNonRecWS}
      ")"
    `}
  `}
  `;

  const windowStatement = getWindowStatement({
    colName: validFullName,
    positiveInteger,
    optionalRecommendedWhitespace: optRecWS,
    optionalNonRecommendedWhitespace: optNonRecWS,
  });

  const direction = _` ${ws} ${_`${$`ASC`} | ${$`DESC`}`} `;
  const overStatement = getOverStatement({
    direction,
    validName: validFullName,
    positiveInteger,
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

  const selectQuery = getSelectQuery({
    joinClause: getJoinClause({
      tableWithOptionalAlias: tableName,
      whitespace: ws,
      joinCondition: getJoinCondition({
        optionalNonRecommendedWhitespace: optNonRecWS,
        equijoinCondition: whereClauseInner,
        whitespace: ws,
      }),
    }),
    limitClause: _`
      ${ws} ${$`LIMIT`}
      ${_`${optRecWS} ${positiveInteger} ","`.wrap('?')}
      ${optRecWS}
      ${positiveInteger}
      ${_`
        ${ws}
        ${$`OFFSET`}
        ${ws}
        ${positiveInteger}
      `.wrap('?')}
    `,

    orderByClause: _`
      ${ws} ${$`ORDER BY`}
      ${ws}
      ${columnNames}
      ${_`${ws} ${asAlias}`.wrap('?')}
      ${_`${direction}`.wrap('?')}
      ${_`
        "," 
        ${optRecWS} 
        ${columnNames} 
        ${_`${direction}`.wrap('?')}
      `.wrap('*')}
    `,
    groupByClause: _`
      ${ws} 
      ${$`GROUP BY`}
      ${ws}
      ${columnNames}
      ${_`${ws} ${asAlias}`.wrap('?')}
      ${_`"," ${optRecWS} ${columnNames}`.wrap('*')}
    `,
    whereClause: _`
      ${ws}
      ${$`WHERE`}
      ${ws}
      ${_`
        ${$`NOT`}
        ${ws}
      `.wrap('?')}
      ${whereClauseInner}
      ${_`
        ${_` ${ws} ${$`AND`} ${ws} ${whereClauseInner} `}
        | ${_` ${ws} ${$`OR`} ${ws} ${whereClauseInner} `}
      `.wrap('*')}
    `,
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
    validTableName: validFullName,
    table: tableName,
    optionalRecommendedWhitespace: optRecWS,
    whitespace: ws,
  });
  if (withUnion) {
    return _`
      ${selectQuery}
      ${_`
        ${ws} 
        ${$`UNION`} 
        ${ws} 
        ${_`
          ${$`ALL`} 
          ${ws}
        `.wrap('?')} 
        ${selectQuery}
      `.wrap('*')
      }
    `;
  }
  return selectQuery;
};

