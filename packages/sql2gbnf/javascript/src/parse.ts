import {
  BOOLEAN_KEY,
  COMMA_KEY,
  NULL_KEY,
  NUMBER_KEY,
  DOUBLE_QUOTE_KEY,
  SEMI_KEY,
  STRING_KEY,
  SINGLE_QUOTE_KEY,
  LEFT_PAREN_KEY,
  RIGHT_PAREN_KEY,
} from "./constants/grammar-keys.js";
import { GrammarBuilder, } from "gbnf";
import { buildCase, } from "./utils/build-case.js";
import {
  WHITESPACE_KEY,
  join,
  joinPipe,
} from "gbnf";

const getSelectQuery = ({
  distinctKey,
  selectColumnsKey,
  selectKey,
  fromKey,
  tableNameKey,
  whereClauseKey,
  orderByClauseKey,
  limitClauseKey,
  joinClauseKey,
}: {
  distinctKey: string;
  selectColumnsKey: string;
  selectKey: string;
  fromKey: string;
  tableNameKey: string,
  whereClauseKey: string;
  orderByClauseKey: string;
  limitClauseKey: string;
  joinClauseKey: string;
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
    `(${joinClauseKey})?`,
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

export const getJoinClause = ({
  joinKey,
  joinTypeKey,
}: {
  joinTypeKey: string,
  joinKey: string;
}) => join(
  WHITESPACE_KEY,
  `(${joinTypeKey})?`,
  joinKey,
  WHITESPACE_KEY,
  // `(${joinPipe(innerKey, outerKey, leftKey, rightKey, fullKey)})`,
  // WHITESPACE_KEY,
  // STRING_KEY,
  // WHITESPACE_KEY,
  // `(${join(
  //   WHITESPACE_KEY,
  //   STRING_KEY,
  //   WHITESPACE_KEY,
  //   STRING_KEY,
  //   WHITESPACE_KEY,
  //   `(${join(
  //     WHITESPACE_KEY,
  //     STRING_KEY,
  //   )})?`,
  // )})?`,
);

export const SELECT_KEY = 'select';
export const FROM_KEY = 'from';
export const WHERE = 'where';
export const ORDER = 'order';
export const LIMIT = 'limit';
export const AND = 'and';
export const AS = 'as';
export const OR = 'or';
export const NOT = 'not';
export const IS = 'is';
export const IN = 'in';
export const LIKE_KEY = 'like';
export const BETWEEN = 'between';
export const ANY_OPERATOR_KEY = 'anyop';
export const NUMERIC_OPERATORS_KEY = 'numop';
export const STR_OPERATORS_KEY = 'strop';
export const AGGREGATOR_FUNCTION_KEY = 'agg';
export const SELECT_LIST_KEY = 'selectlist';
export const SELECT_COLUMNS_KEY = 'selectcols';
export const TABLE = 'table';
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
export const DIR = 'dir';
export const ORDER_CLAUSE = 'orderclause';
export const LIMIT_CLAUSE = 'limitclause';
export const DISTINCT = 'dnct';
export const JOIN = 'join';
export const JOIN_TYPE = 'jointype';
export const INNER = 'inner';
export const OUTER = 'outer';
export const FULL_OUTER_TYPE = 'outertype';
export const LEFT = 'left';
export const RIGHT = 'right';
export const FULL = 'full';
export const JOIN_CLAUSE = 'joinclause';
export const SELECT_QUERY = 'selectquery';

export const parse = (
  parser: GrammarBuilder,
  symbolName: string,
  // schema?: string,
) => {
  const root = `${SELECT_QUERY}`;
  parser.addRule(root, symbolName);
  const KEYS = ([
    [SELECT_KEY, ['select',],],
    [FROM_KEY, ['from',],],
    [WHERE, ['where',],],
    [ORDER, ['order by',],],
    [LIMIT, ['limit',],],
    [AND, ['AND',],],
    [AS, ['AS',],],
    [OR, ['OR',],],
    [NOT, ['NOT',],],
    [IS, ['IS',],],
    [IN, ['IN',],],
    [LIKE_KEY, ['LIKE',],],
    [BETWEEN, ['between',],],
    [DIR, ['asc', 'desc',],],
    [DISTINCT, ['distinct',],],
    [JOIN, ['join',],],
    [INNER, ['inner',],],
    [OUTER, ['outer',],],
    [LEFT, ['left',],],
    [RIGHT, ['right',],],
    [FULL, ['full',],],
  ] as [string, string[]][]).reduce<Record<string, string>>((acc, [key, words,]) => ({
    ...acc,
    [key]: parser.addRule(buildCase(...words), key),
  }), {});
  const anyOperatorKey = parser.addRule(joinPipe(
    `"="`,
    KEYS[IS],
  ), ANY_OPERATOR_KEY);
  const numericOperatorsKey = parser.addRule(joinPipe(
    '">"',
    '"<"',
    '">="',
    '"<="',
  ), NUMERIC_OPERATORS_KEY);
  const strOperatorsKey = parser.addRule(`${KEYS[LIKE_KEY]}`, STR_OPERATORS_KEY);
  const aggregatorFunctionKey = parser.addRule(buildCase(
    'MIN',
    'MAX',
    'AVG',
    'SUM',
    'COUNT',
  ), AGGREGATOR_FUNCTION_KEY);
  const selectListKey = parser.addRule(getSelectList({ asKey: KEYS[AS], aggregatorFunctionKey, }), SELECT_LIST_KEY);
  const selectColumnsKey = parser.addRule(getSelectSpecificColumns(selectListKey), SELECT_COLUMNS_KEY);
  const tableNameKey = parser.addRule(getTableName(), TABLE);
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
    KEYS[IN],
    WHITESPACE_KEY,
    LEFT_PAREN_KEY,
    stringWithQuotesKey,
    `(${COMMA_KEY} ${OPTIONAL_WHITESPACE_KEY} ${stringWithQuotesKey})*`,
    RIGHT_PAREN_KEY,
  ), IN_WHERE_CLAUSE);
  const betweenClause = parser.addRule(join(
    KEYS[BETWEEN],
    WHITESPACE_KEY,
    NUMBER_KEY,
    WHITESPACE_KEY,
    KEYS[AND],
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
  const andMoreKey = parser.addRule(`${WHITESPACE_KEY} ${KEYS[AND]} ${whereClauseInnerKey}`, AND_MORE);
  const orMoreKey = parser.addRule(`${WHITESPACE_KEY} ${KEYS[OR]} ${whereClauseInnerKey}`, OR_MORE);
  const whereClauseKey = parser.addRule(getWhereClause({
    notKey: KEYS[NOT],
    whereClauseInnerKey,
    whereKey: KEYS[WHERE],
    andMoreKey,
    orMoreKey,
  }), WHERE_CLAUSE);
  const orderByClauseKey = parser.addRule(getOrderByClause({
    orderKey: KEYS[ORDER],
    directionKey: KEYS[DIR],
  }), ORDER_CLAUSE);
  const limitClauseKey = parser.addRule(getLimitClause({
    limitKey: KEYS[LIMIT],
  }), LIMIT_CLAUSE);
  const fullOuterKey = parser.addRule(join(
    `(${KEYS[FULL]} ${WHITESPACE_KEY})?`,
    `(${KEYS[OUTER]} ${WHITESPACE_KEY})?`,
  ), FULL_OUTER_TYPE);
  const joinTypeKey = parser.addRule(joinPipe(
    `(${KEYS[INNER]} ${WHITESPACE_KEY})`,
    `(${KEYS[LEFT]} ${WHITESPACE_KEY})`,
    `(${KEYS[RIGHT]} ${WHITESPACE_KEY})`,
    `(${fullOuterKey})`,
  ), JOIN_TYPE);
  const joinClauseKey = parser.addRule(getJoinClause({
    joinKey: KEYS[JOIN],
    joinTypeKey,
  }), JOIN_CLAUSE);
  parser.addRule(getSelectQuery({
    distinctKey: KEYS[DISTINCT],
    joinClauseKey,
    limitClauseKey,
    orderByClauseKey,
    whereClauseKey,
    selectColumnsKey,
    selectKey: KEYS[SELECT_KEY],
    fromKey: KEYS[FROM_KEY],
    tableNameKey,
  }), SELECT_QUERY);
};
