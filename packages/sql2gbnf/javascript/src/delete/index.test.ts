import {
  describe,
  test,
  expect,
} from 'vitest';
import {
  getDeleteRule,
} from './index.js';
import {
  $,
  _,
} from 'gbnf/builder-v2';
import GBNF from 'gbnf';

describe('delete', () => {
  test.each([
    'DELETE',
    'delete',
    'DELETE FROM',
    'delete from',
    'DELETE FROM table',
    'DELETE FROM table t',
    'DELETE FROM table t USING customers c',
    'DELETE FROM table t JOIN products p',
    'DELETE FROM table t JOIN products p ON o.product_id = p.product_id',
    // `DELETE FROM orders o
    // USING customers c
    // JOIN products p ON o.product_id = p.product_id
    // WHERE o.total_amount > 100
    // AND c.country = 'USA'
    // AND p.category = 'Electronics'
    // ORDER BY o.order_date DESC
    // LIMIT 10;`
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const ws = _`[ \\n\\r]`;
    const validFullName = _`[a-zA-Z_.0-9]`.wrap('+');
    const grammar = getDeleteRule({
      validFullName,
      boolean: _`"TRUE" | "FALSE" | "true" | "false"`,
      number: _`("-"? ([0-9] | [1-9] [0-9]*)) ("." [0-9]+)? ([eE] [-+]? [0-9]+)? `,
      stringWithQuotes: _`${_`"'" ${validFullName} "'"`} | ${_`"\\"" ${validFullName} "\\""`}`,
      mandatoryWhitespace: ws.wrap('+'),
      optionalRecommendedWhitespace: ws.wrap('*'),
      optionalNonRecommendedWhitespace: ws.wrap('*'),
      positiveInteger: _`[0-9] | [1-9] [0-9]*`.wrap('?'),
      equalOps: _`
    "=" 
    | "!=" 
    | ${_`
      ${$`IS`} 
      ${ws} 
      ${_`
        ${$`NOT`} 
        ${ws}
        `.wrap('?')}
      `}
  `,
      arithmeticOps: _`"+" | "-" | "*" | "/"`,
      numericOps: _`">" | "<" | ">=" | "<="`,
    });
    let parser = GBNF([
      grammar.compile({
        caseKind: 'any',
      }),
    ].join('\n'));
    parser = parser.add(initial.split('\\n').join('\n'));
    expect(parser.size).toBeGreaterThan(0);
  });
});

