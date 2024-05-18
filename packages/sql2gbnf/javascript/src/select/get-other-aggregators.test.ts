import {
  describe,
  test,
  expect,
} from 'vitest';
import GBNF from "gbnf";
import { getOtherAggregators } from './get-other-aggregators.js';

describe('getOtherAggregators', () => {
  const grammar = getOtherAggregators({
    leftParen: '"("',
    rightParen: '")"',
    arithmeticOps: '("+" | "-" | "*" | "/")',
    validName: 'validName',
    optionalNonRecommendedWhitespace: 'optws',
    whitespace: 'ws',
    optionalRecommendedWhitespace: 'optws',
    aggregatorOps: '("SUM" | "AVG" | "MIN" | "MAX")',
    distinct: '"DISTINCT"',
  });

  test.each([
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

