import {
  BOOLEAN,
  COMMA_KEY,
  NUMBER,
  DOUBLE_QUOTE_KEY,
  SINGLE_QUOTE_KEY,
  LEFT_PAREN_KEY,
  RIGHT_PAREN_KEY,
  POSITIVE_INTEGER_KEY as POSITIVE_INTEGER,
  SEMI_KEY,
} from "../constants/grammar-keys.js";
import {
  AGGREGATORS,
  AND,
  AND_MORE,
  EQUAL_OPS,
  ANY_WHERE_CLAUSE,
  AS,
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
  LIKE,
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
  PROJECTION,
  SELECT,
  COLUMN_NAMES,
  SELECT_QUERY,
  STRING_WITH_DOUBLE_QUOTES,
  STRING_WITH_QUOTES,
  STRING_WITH_SINGLE_QUOTES,
  STRING_OPS,
  TABLE,
  WHERE,
  WHERE_CLAUSE,
  WHERE_INNER,
  WILDCARD_WHERE_CLAUSE,
  AS_COL_ALIAS,
  AS_TABLE_ALIAS,
  SELECT_TABLES,
  SELECT_QUERY_WITH_UNION,
  UNION,
  ALL,
  ON,
  GROUP,
  GROUP_CLAUSE,
  ANY_VALID_STRING_VALUE_IN_QUOTES,
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
  INTO,
  JOIN_CONDITION,
  PROJECTION_WITH_SPECIFIC_COLUMNS,
  COUNT_AGGREGATOR_RULE,
  OTHER_AGGREGATORS_RULE,
  // QUOTE,
  VALID_NAME,
  VALID_FULL_NAME,
} from "../gbnf-keys.js";
import { getJoinClause, } from "./get-join-clause.js";
import { getLimitClause, } from "./get-limit-clause.js";
import { getOrderByClause, } from "./get-order-by-clause.js";
import { getColumnNames, } from "./get-column-names.js";
import { getSelectQuery, } from "./get-select-query.js";
import { getProjection, getProjectionWithSpecificColumns, } from "./get-projection.js";
import { getTableName, } from "./get-table-name.js";
import { getWhereClause, } from "./get-where-clause.js";
import { buildCase, } from "../utils/build-case.js";
import {
  GrammarBuilder,
  join,
} from "gbnf";
import { getTables, } from "./get-tables.js";
import { rule, } from "./get-rule.js";
import { opt, } from "./get-optional.js";
import { getSelectQueryWithUnion, } from "./get-select-query-with-union.js";
import { getGroupByClause, } from "./get-group-by-clause.js";
import { getHavingClause, } from "./get-having-clause.js";
import { getOverStatement, } from "./get-over-statement.js";
import { getWindowStatement, } from "./get-window-statement.js";
import { getWhitespaceDefs, } from "./get-whitespace-def.js";
import { CaseKind, WhitespaceKind, } from "../types.js";
import { getJoinCondition, } from "./get-join-condition.js";
import { any, } from "../utils/any.js";
import { getCountAggregator, } from "./get-column-count-aggregator.js";
import { getOtherAggregators, } from "./get-other-aggregators.js";
import { star, } from "./get-star.js";
import { positiveIntegerDef, validNameDef, } from "../constants/grammar-definitions.js";

export const select = (
  parser: GrammarBuilder,
  KEYS: Record<string, string>,
  {
    whitespace: whitespaceKind,
    case: caseKind,
  }: {
    whitespace: WhitespaceKind;
    case: CaseKind,
  }
): string => {
  const validName = parser.addRule(validNameDef, VALID_NAME);
  const validFullName = parser.addRule(join(
    validName,
    star(
      '"."',
      validName,
    ),
  ), VALID_FULL_NAME);
  const {
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  } = getWhitespaceDefs(parser, whitespaceKind);
  // const quote = parser.addRule(any(SINGLE_QUOTE_KEY, DOUBLE_QUOTE_KEY), QUOTE);
  const equalOps = parser.addRule(any(
    `"="`,
    `"!="`,
    KEYS[IS],
    rule(join(KEYS[IS], mandatoryWhitespace, KEYS[NOT]))
  ), EQUAL_OPS);
  const arithmeticOps = parser.addRule(any(
    '"+"',
    '"-"',
    '"*"',
    '"-"',
  ), ARITHMETIC_OPS);
  const numericOps = parser.addRule(any(
    '">"',
    '"<"',
    '">="',
    '"<="',
  ), NUMERIC_OPS);
  const stringOps = parser.addRule(`${KEYS[LIKE]}`, STRING_OPS);
  const aggregatorOps = parser.addRule(buildCase(
    caseKind,
    'MIN',
    'MAX',
    'AVG',
    'SUM',
  ), AGGREGATORS);
  const asColAlias = parser.addRule(join(
    KEYS[AS],
    mandatoryWhitespace,
    validFullName
  ), AS_COL_ALIAS);
  const asTableAlias = parser.addRule(join(
    '',
    validFullName
  ), AS_TABLE_ALIAS);
  const countAggregatorRule = parser.addRule(getCountAggregator({
    countAggregator: KEYS[COUNT_AGGREGATOR],
    validName: validFullName,
    arithmeticOps,
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
    aggregatorOps,
    validName: validFullName,
    arithmeticOps,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
    distinct: KEYS[DISTINCT],
  }), OTHER_AGGREGATORS_RULE);
  const columnNames = parser.addRule(getColumnNames({
    otherAggregatorsRule,
    countAggregatorRule,
    validName: validFullName,
  }), COLUMN_NAMES);
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
  const projectionWithSpecificColumns = parser.addRule(getProjectionWithSpecificColumns({
    optionalRecommendedWhitespace: optionalRecommendedWhitespace,
    columnNames,
    overStatement,
    asAlias: asColAlias,
    windowStatement,
    whitespace: mandatoryWhitespace,
  }), PROJECTION_WITH_SPECIFIC_COLUMNS);
  const projection = parser.addRule(getProjection({
    projectionWithSpecificColumns,
  }), PROJECTION);
  const tableName = parser.addRule(getTableName({
    validName: validFullName,
    asAlias: asTableAlias,
    whitespace: mandatoryWhitespace,
  }), TABLE);
  const selectTables = parser.addRule(getTables({
    optionalWhitespace: optionalRecommendedWhitespace,
    table: tableName,
  }), SELECT_TABLES);
  const anyValidStringValueInQuotes = parser.addRule('[^\'\\"]+', ANY_VALID_STRING_VALUE_IN_QUOTES);
  const stringWithSingleQuotesKey = parser.addRule(join(
    SINGLE_QUOTE_KEY,
    anyValidStringValueInQuotes,
    SINGLE_QUOTE_KEY,
  ), STRING_WITH_SINGLE_QUOTES);
  const stringWithDoubleQuotesKey = parser.addRule(join(
    DOUBLE_QUOTE_KEY,
    anyValidStringValueInQuotes,
    DOUBLE_QUOTE_KEY,
  ), STRING_WITH_DOUBLE_QUOTES);
  const stringWithQuotes = parser.addRule(`(${any(
    stringWithSingleQuotesKey,
    stringWithDoubleQuotesKey,
  )})`, STRING_WITH_QUOTES);
  const stringWildcard = stringWithQuotes;
  // const valueKey = parser.addRule(any(
  //   NUMBER,
  //   NULL_KEY,
  //   BOOLEAN,
  //   stringWithQuotes,
  // ), VALUE);
  const equalClause = parser.addRule(join(
    equalOps,
    optionalRecommendedWhitespace,
    any(validFullName, positiveIntegerDef, stringWithQuotes),
    // valueKey,
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
    numericOps,
    optionalRecommendedWhitespace,
    any(
      rule(NUMBER),
      dateDef,
    ),
  ), NUMERIC_WHERE_CLAUSE);
  const wildcardClause = parser.addRule(join(
    stringOps,
    optionalRecommendedWhitespace,
    stringWildcard,
  ), WILDCARD_WHERE_CLAUSE);
  const inClause = parser.addRule(join(
    KEYS[IN],
    mandatoryWhitespace,
    LEFT_PAREN_KEY,
    optionalNonRecommendedWhitespace,
    stringWithQuotes,
    `${rule(COMMA_KEY, optionalRecommendedWhitespace, stringWithQuotes)}*`,
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
    // tableName,
    validFullName,
    // '[a-zA-Z0-9.]*',
    // '"T2.id"',
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
    asAlias: asColAlias,
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
  // const equijoinCondition = parser.addRule(getEquijoinCondition({
  //   tableName,
  //   optionalRecommendedWhitespace,
  //   whereClauseInner,
  //   validColName: validFullName,
  //   quote,
  // }), EQUIJOIN_CONDITION);
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
    asAlias: asColAlias,
    optionalWhitespace: optionalRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  }), GROUP_CLAUSE);
  const havingClause = parser.addRule(getHavingClause({
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    having: KEYS[HAVING],
    validColName: columnNames,
    asAlias: asColAlias,
    number: NUMBER,
    string: stringWithQuotes,
    is: KEYS[IS],
    not: KEYS[NOT],
    nullKey: KEYS[NULL],
    numericOps,
    stringOps,
    equalOps,
    stringWildcard,
    boolean: BOOLEAN,
    whitespace: mandatoryWhitespace,
  }), HAVING_CLAUSE);
  const selectQuery = parser.addRule(getSelectQuery({
    distinct: KEYS[DISTINCT],
    joinClause,
    limitClause,
    orderByClause,
    groupByClause,
    whereClause,
    projection,
    havingClause,
    select: KEYS[SELECT],
    from: KEYS[FROM],
    selectTables,
    whitespace: mandatoryWhitespace,
    validTableName: validFullName,
    into: KEYS[INTO],
  }), SELECT_QUERY);
  parser.addRule(getSelectQueryWithUnion({
    whitespace: mandatoryWhitespace,
    selectQuery,
    union: KEYS[UNION],
    all: KEYS[ALL],
  }), SELECT_QUERY_WITH_UNION);
  return join(SELECT_QUERY_WITH_UNION,
    opt(opt(mandatoryWhitespace), SEMI_KEY),
  );
};

