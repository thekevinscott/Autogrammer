import {
  describe,
  test,
  expect,
} from 'vitest';
import GBNF from "gbnf";
import { getOverStatement } from "./get-over-statement.js";

describe('getOverStatement', () => {
  test.each([
    `OVER (PARTITION BY department_id)`,
    `OVER (ORDER BY employee_id)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id ROWS BETWEEN CURRENT ROW AND 5 FOLLOWING)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING)`,
    `OVER (ORDER BY employee_id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)`,
    `OVER (ORDER BY salary DESC)`,
    `OVER (ORDER BY employee_id)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN CURRENT ROW AND CURRENT ROW)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN 2 PRECEDING AND CURRENT ROW)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN CURRENT ROW AND 100 FOLLOWING)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN 3 PRECEDING AND 5 FOLLOWING)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN INTERVAL '1' DAY PRECEDING AND CURRENT ROW)`,
    `OVER (PARTITION BY department_id ORDER BY employee_id RANGE BETWEEN INTERVAL '1' MONTH PRECEDING AND CURRENT ROW)`,
    `OVER (ORDER BY transaction_date RANGE BETWEEN CURRENT ROW AND INTERVAL '2' HOUR FOLLOWING)`,
    `OVER (ORDER BY transaction_date RANGE BETWEEN INTERVAL '1' MONTH PRECEDING AND INTERVAL '1' MONTH FOLLOWING)`,
    `OVER (ORDER BY transaction_date RANGE BETWEEN INTERVAL '1-2' YEAR TO MONTH PRECEDING AND CURRENT ROW)`,
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const grammar = getOverStatement({
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
    let parser = GBNF([
      `root ::= ${grammar}`,
      `ws ::= " "`,
      `optws ::= (" ")?`,
      `lparen ::= "("`,
      `rparen ::= ")"`,
      `validName ::= ([a-zA-Z_.])+`,
    ].join('\n'));
    parser = parser.add(initial.split('\\n').join('\n'));
    expect(parser.size).toBeGreaterThan(0);
  });

});
