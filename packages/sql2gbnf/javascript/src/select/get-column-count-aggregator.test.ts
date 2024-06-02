import {
  describe,
  test,
  expect,
} from 'vitest';
import GBNF from "gbnf";
import { getCountAggregator } from './get-column-count-aggregator.js';
import { GrammarBuilder } from 'gbnf/builder-v2';

describe('getCountAggregator', () => {
  const grammarBuilder = new GrammarBuilder();
  const grammar = getCountAggregator(grammarBuilder, {
    leftParen: '"("',
    rightParen: '")"',
    countAggregator: '"COUNT"',
    arithmeticOps: '("+" | "-" | "*" | "/")',
    validName: 'validName',
    optionalNonRecommendedWhitespace: 'optws',
    whitespace: 'ws',
    optionalRecommendedWhitespace: 'optws',
    distinct: '"DISTINCT"',
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
