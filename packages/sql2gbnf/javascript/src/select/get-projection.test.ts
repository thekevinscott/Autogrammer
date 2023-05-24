import {
  describe,
  test,
  expect,
} from 'vitest';
import GBNF from "gbnf";
import { getProjectionWithSpecificColumns } from './get-projection.js';
import { getColumnNames } from './get-column-names.js';
import { getOtherAggregators } from './get-other-aggregators.js';
import { getCountAggregator } from './get-column-count-aggregator.js';
import { getOverStatement } from './get-over-statement.js';
import { getWindowStatement } from './get-window-statement.js';

describe('getProjectionWithSpecificColumns', () => {
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

  const windowStatement = getWindowStatement({
    rank: '"RANK"',
    denserank: '"DENSE_RANK"',
    rownumber: '"ROW_NUMBER"',
    colName: 'validName',
    comma: '","',
    positiveInteger: '[0-9]+',
    lead: '"LEAD"',
    lag: '"LAG"',
    optionalNonRecommendedWhitespace: 'optws',
    whitespace: 'ws',
    optionalRecommendedWhitespace: 'optws',
    leftparen: '"("',
    rightparen: '")"',
  });

  const grammar = getProjectionWithSpecificColumns({
    optionalRecommendedWhitespace: 'optws',
    columnNames: getColumnNames({
      validName: 'validName',
      otherAggregatorsRule: getOtherAggregators({
        leftParen: '"("',
        rightParen: '")"',
        arithmeticOps: '("+" | "-" | "*" | "/")',
        optionalNonRecommendedWhitespace: 'optws',
        whitespace: 'ws',
        optionalRecommendedWhitespace: 'optws',
        distinct: '"DISTINCT"',
        validName: 'validName',
        aggregatorOps: '("SUM" | "AVG" | "MIN" | "MAX")',
      }),
      countAggregatorRule: getCountAggregator({
        validName: 'validName',
        leftParen: '"("',
        rightParen: '")"',
        countAggregator: '"COUNT"',
        arithmeticOps: '("+" | "-" | "*" | "/")',
        optionalNonRecommendedWhitespace: 'optws',
        whitespace: 'ws',
        optionalRecommendedWhitespace: 'optws',
        distinct: '"DISTINCT"',
      }),
    }),
    windowStatement: 'windowstatement',
    whitespace: 'ws',
    asAlias: '"AS " validName',
    overStatement: 'overstatement',
  });

  test.each([
    "foo, bar",
    "col AS foo",
    "COUNT(*)",
    "MIN(col)",
    "COUNT(foo)",
    "COUNT(foo) AS foo",
    "col",
    "rank",
    "salary OVER (PARTITION BY department_id)",
    "SUM(salary) OVER (PARTITION BY department_id)",
    "SUM(salary) OVER (PARTITION BY department_id) AS foo",
    "SUM(salary) OVER (PARTITION BY department_id) AS foo, SUM(salary) OVER (PARTITION BY department_id) AS foo",
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const fullGrammar = [
      `root ::= ${grammar}`,
      `overstatement ::= ${overStatement}`,
      `windowstatement ::= ${windowStatement}`,
      `com ::= ","`,
      `ws ::= (" ")+`,
      `optws ::= (" ")*`,
      `optnws ::= optws`,
      `validName ::= ([a-zA-Z1-9_.])+`,
    ].join('\n')
    let parser = GBNF(fullGrammar);
    parser = parser.add(initial.split('\\n').join('\n').split('\\t').join('\t'));
    expect(parser.size).toBeGreaterThan(0);
  });
});
