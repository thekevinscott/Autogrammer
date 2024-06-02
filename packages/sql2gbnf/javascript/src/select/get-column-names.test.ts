import {
  describe,
  test,
  expect,
} from 'vitest';
import GBNF from "gbnf";
import { getColumnNames } from './get-column-names.js';
import { getOtherAggregators } from './get-other-aggregators.js';
import { getCountAggregator } from './get-column-count-aggregator.js';
import { GrammarBuilder } from 'gbnf/builder-v2';

describe('getColumnNames', () => {
  const grammarBuilder = new GrammarBuilder();
  const grammar = getColumnNames({
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
    countAggregatorRule: getCountAggregator(grammarBuilder, {
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
  });

  test.each([
    "COUNT(*)",
    "COUNT( * )",
    "COUNT(foo)",
    "COUNT( foo )",
    "COUNT(DISTINCT column1)",
    "COUNT( DISTINCT column1 )",
    "COUNT(1)",
    "COUNT( 1 )",
    "COUNT(column1 + column2)",
    "COUNT( column1 + column2 )",
    ...[
      'MIN',
      'MAX',
      'SUM',
      'AVG',
    ].reduce<string[]>((acc, aggregator) => {
      return acc.concat([
        `${aggregator}(foo)`,
        `${aggregator}( foo )`,
        `${aggregator}(DISTINCT column1)`,
        `${aggregator}( DISTINCT column1 )`,
        `${aggregator}(column1 + column2)`,
        `${aggregator}( column1 + column2 )`,
      ]);
    }, []),
    'foo',
    'foo.bar',
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const fullGrammar = [
      `root ::= ${grammar}`,
      `com ::= ","`,
      `ws ::= (" ")+`,
      `optws ::= (" ")*`,
      `validName ::= ([a-zA-Z1-9_.])+`,
    ].join('\n');
    let parser = GBNF(fullGrammar);
    parser = parser.add(initial.split('\\n').join('\n').split('\\t').join('\t'));
    expect(parser.size).toBeGreaterThan(0);
  });
});

