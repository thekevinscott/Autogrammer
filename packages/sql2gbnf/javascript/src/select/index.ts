import {
  BOOLEAN,
  COMMA_KEY,
  NULL_KEY,
  NUMBER,
  DOUBLE_QUOTE_KEY,
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
  SELECT_COLUMNS,
  SELECT,
  COLUMN_NAMES_WITH_OVER_CAPABILITY,
  SELECT_QUERY,
  STRING_WITH_DOUBLE_QUOTES,
  STRING_WITH_QUOTES,
  STRING_WITH_SINGLE_QUOTES,
  STRING_OPS,
  TABLE,
  VALID_COL_NAME,
  VALUE,
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
  VALID_TABLE_NAME,
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
  COLUMN_NAMES_WITHOUT_OVER_CAPABILITY,
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
  WINDOW_STATEMENT as WINDOW_STATEMENT,
  RANK,
  DENSE_RANK,
  ROW_NUMBER,
  LAG,
  LEAD,
  DATE_DEFINITION,
  OFFSET,
} from "../gbnf-keys.js";
import { getJoinClause, } from "./get-join-clause.js";
import { getLimitClause, } from "./get-limit-clause.js";
import { getOrderByClause, } from "./get-order-by-clause.js";
import { getColumnName, } from "./get-column-name.js";
import { getSelectQuery, } from "./get-select-query.js";
import { getSelectColumns, } from "./get-select-columns.js";
import { getTableName, } from "./get-table-name.js";
import { getWhereClause, } from "./get-where-clause.js";
import { buildCase, } from "../utils/build-case.js";
import {
  GrammarBuilder,
  join,
  joinPipe,
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

export const VALID_COL_NAME_GBNF = `[a-zA-Z_] [A-Za-z0-9_.]*`;
export const VALID_TABLE_NAME_GBNF = `[a-zA-Z_] [a-zA-Z0-9_.]*`;

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
  const {
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  } = getWhitespaceDefs(parser, whitespaceKind);
  const equalOps = parser.addRule(joinPipe(
    `"="`,
    `"!="`,
    KEYS[IS],
    rule(join(KEYS[IS], mandatoryWhitespace, KEYS[NOT]))
  ), EQUAL_OPS);
  const arithmeticOps = parser.addRule(joinPipe(
    '"+"',
    '"-"',
    '"*"',
    '"-"',
  ), ARITHMETIC_OPS);
  const numericOps = parser.addRule(joinPipe(
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
  const validColName = parser.addRule(VALID_COL_NAME_GBNF, VALID_COL_NAME);
  const validTableName = parser.addRule(VALID_TABLE_NAME_GBNF, VALID_TABLE_NAME);
  const asColAlias = parser.addRule(opt(
    mandatoryWhitespace,
    KEYS[AS],
    mandatoryWhitespace,
    validColName
  ), AS_COL_ALIAS);
  const asTableAlias = parser.addRule(opt(
    mandatoryWhitespace,
    validTableName
  ), AS_TABLE_ALIAS);
  const columnNamesWithoutOverCapability = parser.addRule(getColumnName({
    asAlias: asColAlias,
    aggregatorOps,
    countAggregator: KEYS[COUNT_AGGREGATOR],
    validName: validColName,
    arithmeticOps,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  }), COLUMN_NAMES_WITH_OVER_CAPABILITY);
  const overStatement = parser.addRule(getOverStatement({
    over: KEYS[OVER],
    partition: KEYS[PARTITION],
    order: KEYS[ORDER],
    validName: validColName,
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
  }), OVER_CLAUSE);

  const columnNamesWithOverCapability = parser.addRule(getColumnName({
    asAlias: asColAlias,
    aggregatorOps,
    countAggregator: KEYS[COUNT_AGGREGATOR],
    validName: validColName,
    arithmeticOps,
    overStatement,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  }), COLUMN_NAMES_WITHOUT_OVER_CAPABILITY);
  const rankStatement = parser.addRule(getWindowStatement({
    rank: KEYS[RANK],
    denserank: KEYS[DENSE_RANK],
    rownumber: KEYS[ROW_NUMBER],
    overStatement,
    alias: asColAlias,
    colName: validColName,
    comma: COMMA_KEY,
    positiveInteger: POSITIVE_INTEGER,
    lead: KEYS[LEAD],
    lag: KEYS[LAG],
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  }), WINDOW_STATEMENT);
  const selectColumns = parser.addRule(getSelectColumns(parser, {
    optionalRecommendedWhitespace: optionalRecommendedWhitespace,
    columnNames: columnNamesWithOverCapability,
    leadStatement: rankStatement,
  }), SELECT_COLUMNS);
  const tableName = parser.addRule(getTableName({
    validName: validTableName,
    asAlias: asTableAlias,
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
  const stringWithQuotes = parser.addRule(`(${joinPipe(
    stringWithSingleQuotesKey,
    stringWithDoubleQuotesKey,
  )})`, STRING_WITH_QUOTES);
  const stringWildcard = stringWithQuotes;
  const valueKey = parser.addRule(rule(joinPipe(
    NUMBER,
    NULL_KEY,
    BOOLEAN,
    stringWithQuotes,
  )), VALUE);
  const anyWhereClause = parser.addRule(join(
    equalOps,
    optionalRecommendedWhitespace,
    valueKey,
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
    rule(joinPipe(
      rule(NUMBER),
      dateDef,
    )),
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
    rule(joinPipe(
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
    )),
  ), BETWEEN_WHERE_CLAUSE);
  const whereClauseInner = parser.addRule(join(
    validColName,
    rule(joinPipe(
      rule(optionalRecommendedWhitespace, anyWhereClause),
      rule(optionalRecommendedWhitespace, numericClause),
      rule(optionalRecommendedWhitespace, wildcardClause),
      rule(optionalRecommendedWhitespace, betweenClause),
      rule(mandatoryWhitespace, inClause),
    )),
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
    validColName: columnNamesWithoutOverCapability,
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
  const joinType = parser.addRule(joinPipe(
    rule(KEYS[INNER], mandatoryWhitespace),
    rule(KEYS[LEFT], mandatoryWhitespace),
    rule(KEYS[RIGHT], mandatoryWhitespace),
    rule(fullOuter),
  ), JOIN_TYPE);
  const joinClause = parser.addRule(getJoinClause({
    joinKey: KEYS[JOIN],
    joinType,
    on: KEYS[ON],
    columnName: validColName,
    tableWithOptionalAlias: tableName,
    optionalWhitespace: optionalRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  }), JOIN_CLAUSE);
  const groupByClause = parser.addRule(getGroupByClause({
    comma: COMMA_KEY,
    group: KEYS[GROUP],
    validColName: columnNamesWithoutOverCapability,
    optionalWhitespace: optionalRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  }), GROUP_CLAUSE);
  const havingClause = parser.addRule(getHavingClause({
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    having: KEYS[HAVING],
    validColName: columnNamesWithoutOverCapability,
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
    selectColumns,
    havingClause,
    select: KEYS[SELECT],
    from: KEYS[FROM],
    selectTables,
    whitespace: mandatoryWhitespace,
  }), SELECT_QUERY);
  parser.addRule(getSelectQueryWithUnion({
    whitespace: mandatoryWhitespace,
    selectQuery,
    union: KEYS[UNION],
    all: KEYS[ALL],
  }), SELECT_QUERY_WITH_UNION);
  return SELECT_QUERY_WITH_UNION;
};

