import {
  describe,
  test,
  expect,
} from 'vitest';
import GBNF from "gbnf";
import { getWindowStatement } from './get-window-statement.js';

describe('getWindowStatement', () => {
  const grammar = getWindowStatement({
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

  test.each([
    `RANK()`,
    `DENSE_RANK()`,
    `ROW_NUMBER()`,
    `LEAD(salary, 1)`,
    `LEAD(salary, 1, 0)`,
    `LAG(salary, 1)`,
    `LAG(salary, 1, 0)`,
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const fullGrammar = [
      `root ::= ${grammar}`,
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
