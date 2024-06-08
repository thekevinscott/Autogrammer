import {
  describe,
  test,
  expect,
} from 'vitest';
import GBNF from "gbnf";
import { getWindowStatement } from './get-window-statement.js';
import { _ } from 'gbnf/builder';

describe('getWindowStatement', () => {

  test.each([
    `RANK()`,
    `DENSE_RANK()`,
    `ROW_NUMBER()`,
    `LEAD(salary, 1)`,
    `LEAD(salary, 1, 0)`,
    `LAG(salary, 1)`,
    `LAG(salary, 1, 0)`,
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const ws = _`[ ]`;
    const rule = getWindowStatement({
      optionalNonRecommendedWhitespace: ws.wrap('*'),
      optionalRecommendedWhitespace: ws.wrap('*'),
    });
    const fullGrammar = rule.compile();
    let parser = GBNF(fullGrammar);
    parser = parser.add(initial.split('\\n').join('\n').split('\\t').join('\t'));
    expect(parser.size).toBeGreaterThan(0);
  });

  test.each([
    `RANK()`,
    `DENSE_RANK()`,
    `ROW_NUMBER()`,
    `LEAD(salary,1)`,
    `LEAD(salary,1,0)`,
    `LAG(salary,1)`,
    `LAG(salary,1,0)`,
  ])('it parses schema with succinct whitespace to grammar with input "%s"', (initial) => {
    const rule = getWindowStatement({
      optionalNonRecommendedWhitespace: undefined,
      optionalRecommendedWhitespace: undefined,
    });
    const fullGrammar = rule.compile();
    let parser = GBNF(fullGrammar);
    parser = parser.add(initial.split('\\n').join('\n').split('\\t').join('\t'));
    expect(parser.size).toBeGreaterThan(0);
  });
});
