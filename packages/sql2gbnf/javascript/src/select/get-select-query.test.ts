import {
  describe,
  test,
  expect,
} from 'vitest';
import { getProjection, getProjectionWithSpecificColumns } from './get-projection.js';
import GBNF from "gbnf";
import { getSelectQuery } from './get-select-query.js';
import { getColumnNames } from './get-column-names.js';
import { getOtherAggregators } from './get-other-aggregators.js';
import { getCountAggregator } from './get-column-count-aggregator.js';
import { getOverStatement } from './get-over-statement.js';

describe('getSelectQuery', () => {
  const overStatement = getOverStatement({
    over: '"OVER"',
    order: '"ORDER BY"',
    partition: '"PARTITION BY"',
    validName: 'validName',
    rowsBetween: '"ROWS BETWEEN"',
    currentRow: '"CURRENT ROW"',
    unbounded: '"UNBOUNDED"',
    preceding: '"PRECEDING"',
    following: '"FOLLOWING"',
    and: '"AND"',
    positiveInteger: '([0-9] | [1-9] [0-9]*)?',
    direction: '("ASC" | "DESC")',
    rangeBetween: '"RANGE BETWEEN"',
    interval: '"INTERVAL"',
    year: '"YEAR"',
    minute: '"MINUTE"',
    month: '"MONTH"',
    day: '"DAY"',
    hour: '"HOUR"',
    second: '"SECOND"',
    singleQuote: '"\'"',
    to: '"TO"',
    whitespace: '" "',
    optionalRecommendedWhitespace: '(" ")?',
    optionalNonRecommendedWhitespace: '()',
    leftparen: '"("',
    rightparen: '")"',
  });
  const otherAggregatorsRule = getOtherAggregators({
    leftParen: '"("',
    rightParen: '")"',
    arithmeticOps: '("+" | "-" | "*" | "/")',
    optionalNonRecommendedWhitespace: 'optws',
    whitespace: 'ws',
    optionalRecommendedWhitespace: 'optws',
    distinct: '"DISTINCT"',
    validName: 'validName',
    aggregatorOps: '("SUM" | "AVG" | "MIN" | "MAX")',
  });

  const countAggregatorRule = getCountAggregator({
    validName: 'validName',
    leftParen: '"("',
    rightParen: '")"',
    countAggregator: '"COUNT"',
    arithmeticOps: '("+" | "-" | "*" | "/")',
    optionalNonRecommendedWhitespace: 'optws',
    whitespace: 'ws',
    optionalRecommendedWhitespace: 'optws',
    distinct: '"DISTINCT"',
  });
  const columnNames = getColumnNames({
    validName: 'validName',
    otherAggregatorsRule: 'otherAggregatorsRule',
    countAggregatorRule: 'countAggregatorRule',
  });
  const grammar = getSelectQuery({
    distinct: '"DISTINCT"',
    projection: getProjection({
      projectionWithSpecificColumns: getProjectionWithSpecificColumns({
        overStatement: 'overstatement',
        optionalRecommendedWhitespace: 'optws',
        columnNames: 'columnNames',
        windowStatement: '"rank"',
        whitespace: 'ws',
        asAlias: '"AS " validName',
      }),
    }),
    select: '"SELECT"',
    from: '"FROM"',
    into: '"INTO"',
    whitespace: 'ws',
    validTableName: 'validName',

    selectTables: 'validName',
    whereClause: '"WHERECLAUSE"',
    orderByClause: '"ORDERBYCLAUSE"',
    limitClause: '"LIMITCLAUSE"',
    joinClause: '"JOINCLAUSE"',
    groupByClause: '"GROUPBYCLAUSE"',
    havingClause: '"HAVINGCLAUSE"',
  });

  test.each([
    "SELECT foo FROM table",
    "SELECT foo, bar FROM table",
    "SELECT MIN(foo) FROM table",
    "SELECT foo AS foo1 FROM table",
    "SELECT SUM(salary) OVER (PARTITION BY department_id)",
    "SELECT employee_id AS total_salary_per_department FROM salaries",
    "SELECT employee_id, department_id, salary, SUM(salary) OVER (PARTITION BY department_id) AS total_salary_per_department FROM salaries",
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const fullGrammar = [
      `root ::= ${grammar}`,
      `overstatement ::= ${overStatement}`,
      `otherAggregatorsRule ::= ${otherAggregatorsRule}`,
      `countAggregatorRule ::= ${countAggregatorRule}`,
      `columnNames ::= ${columnNames}`,
      `com ::= ","`,
      `ws ::= (" ")+`,
      `optws ::= (" ")*`,
      `optnws ::= optws`,
      `semi ::= ";"`,
      `validName ::= ([a-zA-Z0-9_.])+`,
    ].join('\n')
    // console.log(fullGrammar);
    let parser = GBNF(fullGrammar);
    parser = parser.add(initial.split('\\n').join('\n').split('\\t').join('\t'));
    expect(parser.size).toBeGreaterThan(0);
  });
});
