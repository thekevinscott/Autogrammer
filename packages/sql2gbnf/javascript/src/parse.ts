import {
  BOOLEAN_KEY,
  COMMA_KEY,
  NULL_KEY,
  NUMBER_KEY,
  DOUBLE_QUOTE_KEY,
  SEMI_KEY,
  STRING_KEY,
  WHITESPACE_KEY,
  SINGLE_QUOTE_KEY,
  LEFT_PAREN_KEY,
  RIGHT_PAREN_KEY,
} from "./constants/grammar-keys.js";
import { Grammar, } from "./grammar.js";
import { buildCase, } from "./utils/build-case.js";
import { join, joinPipe, } from "./utils/join.js";

const getSelectQuery = ({
  distinctKey,
  selectColumnsKey,
  selectKey,
  fromKey,
  tableNameKey,
  whereClauseKey,
  orderByClauseKey,
  limitClauseKey,
}: {
  distinctKey: string;
  selectColumnsKey: string;
  selectKey: string;
  fromKey: string;
  tableNameKey: string,
  whereClauseKey: string;
  orderByClauseKey: string;
  limitClauseKey: string;
}) => {
  return join(
    selectKey,
    `(${WHITESPACE_KEY} ${distinctKey})?`,
    WHITESPACE_KEY,
    `(${joinPipe(selectColumnsKey, '"*"')})`,
    WHITESPACE_KEY,
    fromKey,
    WHITESPACE_KEY,
    tableNameKey,
    `(${whereClauseKey})?`,
    `(${orderByClauseKey})?`,
    `(${limitClauseKey})?`,
    `(${SEMI_KEY})?`,
  );
};

const getSelectList = ({
  asKey,
  aggregatorFunctionKey,
}: {
  asKey: string;
  aggregatorFunctionKey: string;
}) => {
  return `(${STRING_KEY} | (${aggregatorFunctionKey} ${LEFT_PAREN_KEY} ${STRING_KEY} ${RIGHT_PAREN_KEY})) (${WHITESPACE_KEY} ${asKey} ${WHITESPACE_KEY} ${STRING_KEY})?`;
};

const getTableName = () => {
  return STRING_KEY;
};

const getSelectSpecificColumns = (selectListKey: string) => join(
  selectListKey,
  `(${join(
    COMMA_KEY,
    OPTIONAL_WHITESPACE_KEY,
    selectListKey
  )})*`
);

const getWhereClause = ({
  notKey,
  whereClauseInnerKey,
  whereKey,
  andMoreKey,
  orMoreKey,
}: {
  notKey: string;
  whereClauseInnerKey: string;
  whereKey: string;
  andMoreKey: string;
  orMoreKey: string;
}) => join(
  WHITESPACE_KEY,
  whereKey,
  `(${notKey})?`,
  whereClauseInnerKey,
  `(${andMoreKey} | ${orMoreKey})*`,
);

const getOrderByClause = ({
  orderKey,
  directionKey,
}: {
  orderKey: string;
  directionKey: string;
}) => join(
  WHITESPACE_KEY,
  orderKey,
  WHITESPACE_KEY,
  STRING_KEY,
  `(${WHITESPACE_KEY} ${directionKey})?`,
);

const getLimitClause = ({
  limitKey,
}: {
  limitKey: string;
}) => join(
  WHITESPACE_KEY,
  limitKey,
  `(${join(
    WHITESPACE_KEY,
    NUMBER_KEY,
    COMMA_KEY
  )})?`,
  WHITESPACE_KEY,
  NUMBER_KEY,
);

export const SELECT_KEY = 'select';
export const FROM_KEY = 'from';
export const WHERE_KEY = 'where';
export const ORDER_KEY = 'order';
export const LIMIT_KEY = 'limit';
export const AND_KEY = 'and';
export const AS_KEY = 'as';
export const OR_KEY = 'or';
export const NOT_KEY = 'not';
export const IS_KEY = 'is';
export const IN_KEY = 'in';
export const LIKE_KEY = 'like';
export const BETWEEN_KEY = 'between';
export const ANY_OPERATOR_KEY = 'anyop';
export const NUMERIC_OPERATORS_KEY = 'numop';
export const STR_OPERATORS_KEY = 'strop';
export const AGGREGATOR_FUNCTION_KEY = 'agg';
export const SELECT_LIST_KEY = 'selectlist';
export const SELECT_COLUMNS_KEY = 'selectcols';
export const TABLE_KEY = 'table';
export const STRING_WITH_SINGLE_QUOTES_KEY = 'strsq';
export const STRING_WITH_DOUBLE_QUOTES_KEY = 'strdq';
export const STRING_WITH_QUOTES_KEY = 'strq';
export const STRING_WILDCARD_WITH_SINGLE_QUOTES_KEY = 'strmsq';
export const STRING_WILDCARD_WITH_DOUBLE_QUOTES_KEY = 'strmdq';
export const OPTIONAL_WHITESPACE_KEY = 'optws';
export const VALUE_KEY = 'val';
export const ANY_WHERE_CLAUSE = 'anyclause';
export const NUMERIC_WHERE_CLAUSE = 'numclause';
export const WILDCARD_WHERE_CLAUSE = 'wildcardclause';
export const IN_WHERE_CLAUSE = 'inclause';
export const BETWEEN_WHERE_CLAUSE = 'betweenclause';
export const WHERE_INNER = 'whereinner';
export const AND_MORE = 'andmore';
export const OR_MORE = 'ormore';
export const WHERE_CLAUSE = 'whereclause';
export const DIRECTION_KEY = 'dir';
export const ORDER_CLAUSE = 'orderclause';
export const LIMIT_CLAUSE = 'limitclause';
export const DISTINCT_KEY = 'dnct';
export const SELECT_QUERY_KEY = 'selectquery';

export const parse = (
  parser: Grammar,
  symbolName: string,
  schema?: string,
) => {
  const root = `${SELECT_QUERY_KEY}`;
  parser.addRule(root, symbolName);
  const selectKey = parser.addRule(buildCase('select'), SELECT_KEY);
  const fromKey = parser.addRule(buildCase('from'), FROM_KEY);
  const whereKey = parser.addRule(buildCase('where'), WHERE_KEY);
  const orderKey = parser.addRule(buildCase('order by'), ORDER_KEY);
  const limitKey = parser.addRule(buildCase('limit'), LIMIT_KEY);
  const andKey = parser.addRule(buildCase('AND'), AND_KEY);
  const asKey = parser.addRule(buildCase('AS'), AS_KEY);
  const orKey = parser.addRule(buildCase('OR'), OR_KEY);
  const notKey = parser.addRule(buildCase('NOT'), NOT_KEY);
  const isKey = parser.addRule(buildCase('IS'), IS_KEY);
  const inKey = parser.addRule(buildCase('IN'), IN_KEY);
  const likeKey = parser.addRule(buildCase('LIKE'), LIKE_KEY);
  const betweenKey = parser.addRule(buildCase('between'), BETWEEN_KEY);
  const anyOperatorKey = parser.addRule(joinPipe(
    `"="`,
    isKey,
  ), ANY_OPERATOR_KEY);
  const numericOperatorsKey = parser.addRule(joinPipe(
    '">"',
    '"<"',
    '">="',
    '"<="',
  ), NUMERIC_OPERATORS_KEY);
  const strOperatorsKey = parser.addRule(`${likeKey}`, STR_OPERATORS_KEY);
  const aggregatorFunctionKey = parser.addRule(buildCase(
    'MIN',
    'MAX',
    'AVG',
    'SUM',
    'COUNT',
  ), AGGREGATOR_FUNCTION_KEY);
  const selectListKey = parser.addRule(getSelectList({ asKey, aggregatorFunctionKey, }), SELECT_LIST_KEY);
  const selectColumnsKey = parser.addRule(getSelectSpecificColumns(selectListKey), SELECT_COLUMNS_KEY);
  const tableNameKey = parser.addRule(getTableName(), TABLE_KEY);
  const stringWithSingleQuotesKey = parser.addRule(join(
    SINGLE_QUOTE_KEY,
    STRING_KEY,
    SINGLE_QUOTE_KEY,
  ), STRING_WITH_SINGLE_QUOTES_KEY);
  const stringWithDoubleQuotesKey = parser.addRule(join(
    DOUBLE_QUOTE_KEY,
    STRING_KEY,
    DOUBLE_QUOTE_KEY,
  ), STRING_WITH_DOUBLE_QUOTES_KEY);
  const stringWithQuotesKey = parser.addRule(`(${joinPipe(
    stringWithSingleQuotesKey,
    stringWithDoubleQuotesKey,
  )})`, STRING_WITH_QUOTES_KEY);
  const stringWildcardWithSingleQuotesKey = parser.addRule(join(
    SINGLE_QUOTE_KEY,
    STRING_KEY,
    '"%"',
    SINGLE_QUOTE_KEY,
  ), STRING_WILDCARD_WITH_SINGLE_QUOTES_KEY);
  const stringWildcardWithDoubleQuotesKey = parser.addRule(join(
    DOUBLE_QUOTE_KEY,
    STRING_KEY,
    '"%"',
    DOUBLE_QUOTE_KEY,
  ), STRING_WILDCARD_WITH_DOUBLE_QUOTES_KEY);
  const optionalWhitespaceKey = parser.addRule(`(${WHITESPACE_KEY})?`, OPTIONAL_WHITESPACE_KEY);
  const valueKey = parser.addRule(`(${joinPipe(
    NUMBER_KEY,
    NULL_KEY,
    BOOLEAN_KEY,
    stringWithQuotesKey,
  )})`, VALUE_KEY);
  const anyWhereClause = parser.addRule(join(
    anyOperatorKey,
    optionalWhitespaceKey,
    valueKey,
  ), ANY_WHERE_CLAUSE);
  const numericClause = parser.addRule(join(
    numericOperatorsKey,
    optionalWhitespaceKey,
    NUMBER_KEY,
  ), NUMERIC_WHERE_CLAUSE);
  const wildcardClause = parser.addRule(join(
    strOperatorsKey,
    optionalWhitespaceKey,
    `(${joinPipe(
      stringWildcardWithSingleQuotesKey,
      stringWildcardWithDoubleQuotesKey,
    )})`,
  ), WILDCARD_WHERE_CLAUSE);
  const inClause = parser.addRule(join(
    inKey,
    WHITESPACE_KEY,
    LEFT_PAREN_KEY,
    stringWithQuotesKey,
    `(${COMMA_KEY} ${OPTIONAL_WHITESPACE_KEY} ${stringWithQuotesKey})*`,
    RIGHT_PAREN_KEY,
  ), IN_WHERE_CLAUSE);
  const betweenClause = parser.addRule(join(
    betweenKey,
    WHITESPACE_KEY,
    NUMBER_KEY,
    WHITESPACE_KEY,
    andKey,
    WHITESPACE_KEY,
    NUMBER_KEY,
  ), BETWEEN_WHERE_CLAUSE);
  const whereClauseInnerKey = parser.addRule(join(
    WHITESPACE_KEY,
    STRING_KEY,
    optionalWhitespaceKey,
    `(${joinPipe(
      anyWhereClause,
      numericClause,
      wildcardClause,
      inClause,
      betweenClause,
    )})`,
  ), WHERE_INNER);
  const andMoreKey = parser.addRule(`${WHITESPACE_KEY} ${andKey} ${whereClauseInnerKey}`, AND_MORE);
  const orMoreKey = parser.addRule(`${WHITESPACE_KEY} ${orKey} ${whereClauseInnerKey}`, OR_MORE);
  const whereClauseKey = parser.addRule(getWhereClause({
    notKey,
    whereClauseInnerKey,
    whereKey,
    andMoreKey,
    orMoreKey,
  }), WHERE_CLAUSE);
  const directionKey = parser.addRule(buildCase('asc', 'desc'), DIRECTION_KEY);
  const orderByClauseKey = parser.addRule(getOrderByClause({
    orderKey,
    directionKey,
  }), ORDER_CLAUSE);
  const limitClauseKey = parser.addRule(getLimitClause({
    limitKey,
  }), LIMIT_CLAUSE);
  const distinctKey = parser.addRule(buildCase('distinct'), DISTINCT_KEY);
  parser.addRule(getSelectQuery({
    distinctKey,
    limitClauseKey,
    orderByClauseKey,
    whereClauseKey,
    selectColumnsKey,
    selectKey,
    fromKey,
    tableNameKey,
  }), SELECT_QUERY_KEY);
};
