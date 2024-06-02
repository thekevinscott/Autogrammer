import {
  BOOLEAN,
  COMMA_KEY,
  NUMBER,
  SINGLE_QUOTE_KEY,
  LEFT_PAREN_KEY,
  RIGHT_PAREN_KEY,
  POSITIVE_INTEGER_KEY as POSITIVE_INTEGER,
} from "../constants/grammar-keys.js";
import {
  AGGREGATORS,
  AND,
  AND_MORE,
  EQUAL_OPS,
  ANY_WHERE_CLAUSE,
  BETWEEN,
  BETWEEN_WHERE_CLAUSE,
  DIR,
  DISTINCT,
  FROM,
  FULL,
  FULL_OUTER_TYPE,
  IN,
  INNER,
  IN_WHERE_CLAUSE,
  IS,
  JOIN,
  JOIN_CLAUSE,
  JOIN_TYPE,
  LEFT,
  LIMIT,
  LIMIT_CLAUSE,
  NOT,
  NUMERIC_OPS,
  NUMERIC_WHERE_CLAUSE,
  OR,
  ORDER,
  ORDER_CLAUSE,
  OR_MORE,
  OUTER,
  RIGHT,
  SELECT,
  COLUMN_NAMES,
  STRING_OPS,
  TABLE,
  WHERE,
  WHERE_CLAUSE,
  WHERE_INNER,
  WILDCARD_WHERE_CLAUSE,
  AS_COL_ALIAS,
  AS_TABLE_ALIAS,
  UNION,
  ALL,
  ON,
  GROUP,
  GROUP_CLAUSE,
  HAVING,
  ARITHMETIC_OPS,
  COUNT_AGGREGATOR,
  HAVING_CLAUSE,
  NULL,
  OVER,
  PARTITION,
  OVER_CLAUSE,
  ROWS_BETWEEN,
  CURRENT_ROW,
  UNBOUNDED,
  PRECEDING,
  FOLLOWING,
  RANGE_BETWEEN,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  YEAR,
  MONTH,
  INTERVAL,
  TO,
  WINDOW_STATEMENT,
  RANK,
  DENSE_RANK,
  ROW_NUMBER,
  LAG,
  LEAD,
  DATE_DEFINITION,
  OFFSET,
  JOIN_CONDITION,
  COUNT_AGGREGATOR_RULE,
  OTHER_AGGREGATORS_RULE,
  POSSIBLE_COLUMNS_WITH_ALIAS,
} from "../gbnf-keys.js";
import { getJoinClause, } from "./get-join-clause.js";
import { getLimitClause, } from "./get-limit-clause.js";
import { getOrderByClause, } from "./get-order-by-clause.js";
import { getColumnNames, } from "./get-column-names.js";
import { getSelectQuery, } from "./get-select-query.js";
import {
  getPossibleColumnsWithAlias,
  getProjectionWithSpecificColumns,
} from "./get-projection.js";
import { getTableName, } from "./get-table-name.js";
import { getWhereClause, } from "./get-where-clause.js";
import {
  $,
  GrammarBuilder,
  _,
} from "gbnf/builder-v2";
import {
  join,
} from "gbnf/builder-v1";
import { rule, } from "../utils/get-rule.js";
import { opt, } from "../utils/get-optional.js";
import { getSelectQueryWithUnion, } from "./get-select-query-with-union.js";
import { getGroupByClause, } from "./get-group-by-clause.js";
import { getHavingClause, } from "./get-having-clause.js";
import { getOverStatement, } from "./get-over-statement.js";
import { getWindowStatement, } from "./get-window-statement.js";
import type { CaseKind, Database, WhitespaceKind, } from "../types.js";
import { getJoinCondition, } from "./get-join-condition.js";
import { any, } from "../utils/any.js";
import { getCountAggregator, } from "./get-column-count-aggregator.js";
import { getOtherAggregators, } from "./get-other-aggregators.js";
import {
  positiveIntegerDef,
} from "../constants/grammar-definitions.js";
import { getSelectList, } from "./get-select-list.js";
import { star, } from "../utils/get-star.js";
import { addShorthand, } from "../add-shorthand.js";

export const select = (
  parser: GrammarBuilder,
  KEYS: Record<string, string>,
  {
  }: {
    whitespace: WhitespaceKind;
    case: CaseKind,
  },
  database: void | Database,
  {
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
    validFullName,
    withUnion = true,
    singleColumn = false,
  }: {
    stringWithQuotes: string;
    optionalRecommendedWhitespace: string;
    optionalNonRecommendedWhitespace: string;
    mandatoryWhitespace: string;
    validFullName: string;
    withUnion?: boolean;
    singleColumn?: boolean;
  }
): string => {
  addShorthand(_.key(EQUAL_OPS)` ( "=" | "!=" | ${$`IS`} | ${$`IS NOT`} ) `, parser);
  addShorthand(_.key(ARITHMETIC_OPS)` ( "+" | "-" | "*" | "/") `, parser);
  addShorthand(_.key(NUMERIC_OPS)` ( ">" | "<" | ">=" | "<=") `, parser);
  addShorthand($.key(STRING_OPS)`LIKE`, parser);
  addShorthand(_.key(AGGREGATORS)` (${$`MIN`} | ${$`MAX`} | ${$`AVG`} | ${$`SUM`}) `, parser);
  addShorthand(_.key(AS_COL_ALIAS)`${$`AS `} ${validFullName}`, parser);
  addShorthand(_.key(AS_TABLE_ALIAS)`${$`${validFullName}`}`, parser);
  const countAggregatorRule = parser.addRule(getCountAggregator(parser, {
    countAggregator: KEYS[COUNT_AGGREGATOR],
    validName: validFullName,
    arithmeticOps: ARITHMETIC_OPS,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
    leftParen: LEFT_PAREN_KEY,
    rightParen: RIGHT_PAREN_KEY,
    distinct: KEYS[DISTINCT],
  }), COUNT_AGGREGATOR_RULE);
  const otherAggregatorsRule = parser.addRule(getOtherAggregators({
    leftParen: LEFT_PAREN_KEY,
    rightParen: RIGHT_PAREN_KEY,
    aggregatorOps: AGGREGATORS,
    validName: validFullName,
    arithmeticOps: ARITHMETIC_OPS,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
    distinct: KEYS[DISTINCT],
  }), OTHER_AGGREGATORS_RULE);
  const columnNames = parser.addRule(getColumnNames({
    otherAggregatorsRule,
    countAggregatorRule,
    // validName: database ? '{{COLUMN_NAME}}' : validFullName,
    validName: validFullName,

  }), COLUMN_NAMES);
  const tableName = parser.addRule(getTableName({
    validName: validFullName,
    asAlias: AS_TABLE_ALIAS,
    whitespace: mandatoryWhitespace,
  }), TABLE);
  const overStatement = parser.addRule(getOverStatement({
    over: KEYS[OVER],
    partition: KEYS[PARTITION],
    order: KEYS[ORDER],
    validName: validFullName,
    rowsBetween: KEYS[ROWS_BETWEEN],
    currentRow: KEYS[CURRENT_ROW],
    unbounded: KEYS[UNBOUNDED],
    preceding: KEYS[PRECEDING],
    following: KEYS[FOLLOWING],
    and: KEYS[AND],
    positiveInteger: POSITIVE_INTEGER,
    direction: KEYS[DIR],
    rangeBetween: KEYS[RANGE_BETWEEN],
    interval: KEYS[INTERVAL],
    month: KEYS[MONTH],
    year: KEYS[YEAR],
    day: KEYS[DAY],
    hour: KEYS[HOUR],
    minute: KEYS[MINUTE],
    second: KEYS[SECOND],
    singleQuote: SINGLE_QUOTE_KEY,
    to: KEYS[TO],
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
    leftparen: LEFT_PAREN_KEY,
    rightparen: RIGHT_PAREN_KEY,
  }), OVER_CLAUSE);

  const windowStatement = parser.addRule(getWindowStatement({
    rank: KEYS[RANK],
    denserank: KEYS[DENSE_RANK],
    rownumber: KEYS[ROW_NUMBER],
    colName: validFullName,
    comma: COMMA_KEY,
    positiveInteger: POSITIVE_INTEGER,
    lead: KEYS[LEAD],
    lag: KEYS[LAG],
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
    leftparen: LEFT_PAREN_KEY,
    rightparen: RIGHT_PAREN_KEY,
  }), WINDOW_STATEMENT);

  const stringWildcard = stringWithQuotes;
  const equalClause = parser.addRule(join(
    EQUAL_OPS,
    optionalRecommendedWhitespace,
    any(validFullName, positiveIntegerDef, stringWithQuotes),
  ),
    ANY_WHERE_CLAUSE
  );
  const dateDef = parser.addRule(join(
    SINGLE_QUOTE_KEY,
    '[0-9]',
    '[0-9]',
    '[0-9]',
    '[0-9]',
    '"-"',
    '[0-9]',
    '[0-9]',
    '"-"',
    '[0-9]',
    '[0-9]',
    SINGLE_QUOTE_KEY,
  ), DATE_DEFINITION);
  const numericClause = parser.addRule(join(
    NUMERIC_OPS,
    optionalRecommendedWhitespace,
    any(
      rule(NUMBER),
      dateDef,
    ),
  ), NUMERIC_WHERE_CLAUSE);
  const wildcardClause = parser.addRule(join(
    STRING_OPS,
    optionalRecommendedWhitespace,
    stringWildcard,
  ), WILDCARD_WHERE_CLAUSE);
  const inClause = parser.addRule(join(
    KEYS[IN],
    mandatoryWhitespace,
    LEFT_PAREN_KEY,
    optionalNonRecommendedWhitespace,
    stringWithQuotes,
    star(
      COMMA_KEY,
      optionalRecommendedWhitespace,
      stringWithQuotes,
    ),
    optionalNonRecommendedWhitespace,
    RIGHT_PAREN_KEY,
  ), IN_WHERE_CLAUSE);
  const betweenClause = parser.addRule(join(
    KEYS[BETWEEN],
    mandatoryWhitespace,
    any(
      rule(
        NUMBER,
        mandatoryWhitespace,
        KEYS[AND],
        mandatoryWhitespace,
        NUMBER,
      ),
      rule(
        stringWithQuotes,
        mandatoryWhitespace,
        KEYS[AND],
        mandatoryWhitespace,
        stringWithQuotes,
      )
    ),
  ), BETWEEN_WHERE_CLAUSE);
  const whereClauseInner = parser.addRule(join(
    validFullName,
    any(
      rule(optionalRecommendedWhitespace, equalClause),
      rule(optionalRecommendedWhitespace, numericClause),
      rule(optionalRecommendedWhitespace, wildcardClause),
      rule(optionalRecommendedWhitespace, betweenClause),
      rule(mandatoryWhitespace, inClause),
    ),
  ), WHERE_INNER);
  const andMore = parser.addRule(join(
    mandatoryWhitespace,
    KEYS[AND],
    mandatoryWhitespace,
    whereClauseInner
  ), AND_MORE);
  const orMore = parser.addRule(join(
    mandatoryWhitespace,
    KEYS[OR],
    mandatoryWhitespace,
    whereClauseInner
  ), OR_MORE);
  const whereClause = parser.addRule(getWhereClause({
    not: KEYS[NOT],
    whereClauseInner: whereClauseInner,
    where: KEYS[WHERE],
    andMore,
    orMore,
    mandatoryWhitespace: mandatoryWhitespace,
  }), WHERE_CLAUSE);
  const orderByClause = parser.addRule(getOrderByClause({
    order: KEYS[ORDER],
    direction: KEYS[DIR],
    validColName: columnNames,
    asAlias: AS_COL_ALIAS,
    optionalWhitespace: optionalRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  }), ORDER_CLAUSE);
  const limitClause = parser.addRule(getLimitClause({
    limit: KEYS[LIMIT],
    offset: KEYS[OFFSET],
    positiveInteger: POSITIVE_INTEGER,
    comma: COMMA_KEY,
    optionalWhitespace: optionalRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  }), LIMIT_CLAUSE);
  const fullOuter = parser.addRule(join(
    opt(KEYS[FULL], mandatoryWhitespace),
    opt(KEYS[OUTER], mandatoryWhitespace),
  ), FULL_OUTER_TYPE);
  const joinType = parser.addRule(any(
    rule(KEYS[INNER], mandatoryWhitespace),
    rule(KEYS[LEFT], mandatoryWhitespace),
    rule(KEYS[RIGHT], mandatoryWhitespace),
    rule(fullOuter),
  ), JOIN_TYPE);
  const joinCondition = parser.addRule(getJoinCondition({
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    leftParen: LEFT_PAREN_KEY,
    rightParen: RIGHT_PAREN_KEY,
    equijoinCondition: whereClauseInner,
    whitespace: mandatoryWhitespace,
    and: KEYS[AND],
    or: KEYS[OR],
  }), JOIN_CONDITION);

  const joinClause = parser.addRule(getJoinClause({
    joinKey: KEYS[JOIN],
    joinType,
    on: KEYS[ON],
    tableWithOptionalAlias: tableName,
    whitespace: mandatoryWhitespace,
    joinCondition,
  }), JOIN_CLAUSE);
  const groupByClause = parser.addRule(getGroupByClause({
    comma: COMMA_KEY,
    group: KEYS[GROUP],
    validColName: columnNames,
    asAlias: AS_COL_ALIAS,
    optionalWhitespace: optionalRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  }), GROUP_CLAUSE);
  const havingClause = parser.addRule(getHavingClause({
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    having: KEYS[HAVING],
    validColName: columnNames,
    asAlias: AS_COL_ALIAS,
    number: NUMBER,
    string: stringWithQuotes,
    is: KEYS[IS],
    not: KEYS[NOT],
    nullKey: KEYS[NULL],
    numericOps: NUMERIC_OPS,
    stringOps: STRING_OPS,
    equalOps: EQUAL_OPS,
    stringWildcard,
    boolean: BOOLEAN,
    whitespace: mandatoryWhitespace,
  }), HAVING_CLAUSE);

  const possibleColsWithAlias = parser.addRule(getPossibleColumnsWithAlias({
    columnNames,
    overStatement,
    asAlias: AS_COL_ALIAS,
    windowStatement,
    whitespace: mandatoryWhitespace,
  }), POSSIBLE_COLUMNS_WITH_ALIAS);

  const projection = singleColumn && false ? possibleColsWithAlias : rule(getProjectionWithSpecificColumns({
    possibleColsWithAlias,
    comma: COMMA_KEY,
    optionalRecommendedWhitespace: optionalRecommendedWhitespace,
  }));

  const INTO = 'into';
  addShorthand($.key(INTO)`INTO `, parser);

  const selectlist = rule(getSelectList({
    into: INTO,
    from: KEYS[FROM],
    projection,
    whitespace: mandatoryWhitespace,
    validTableName: validFullName,
    comma: COMMA_KEY,
    table: tableName,
    optionalRecommendedWhitespace,
    database,
  }));

  const selectQuery = rule(getSelectQuery({
    distinct: KEYS[DISTINCT],
    joinClause,
    limitClause,
    orderByClause,
    groupByClause,
    whereClause,
    havingClause,
    select: KEYS[SELECT],
    whitespace: mandatoryWhitespace,
    selectlist,
  }));
  if (withUnion) {
    return getSelectQueryWithUnion({
      whitespace: mandatoryWhitespace,
      selectQuery,
      union: KEYS[UNION],
      all: KEYS[ALL],
    });
  }
  return selectQuery;
};

