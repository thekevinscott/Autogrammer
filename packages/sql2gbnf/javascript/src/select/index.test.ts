import {
  describe,
  test,
  expect,
} from 'vitest';
import {
  select,
} from './index.js';
import {
  $,
  _,
} from 'gbnf/builder-v2';
import GBNF from 'gbnf';

describe('select', () => {
  test.each([
    'SELECT',
    'select',
    'SELECT foo FROM table',
    'SELECT (SELECT bar FROM table2) FROM table',
    'SELECT (SELECT (SELECT baz FROM table3) FROM table2) FROM table',
    // you spent so much time wondering if you could, you never stopped to think if you should
    'SELECT (SELECT (SELECT (SELECT qux FROM table4) FROM table3) FROM table2) FROM table',
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const whitespace = _`[ \\n\\r]`;
    const validFullName = _`[a-zA-Z_.0-9]`.wrap('+');
    const grammar = select({
      validFullName,
      boolean: _`${$`TRUE`} | ${$`FALSE`}`,
      number: _`
        ${_`"-"? ([0-9] | [1-9] [0-9]*)`} 
        ${_`"." [0-9]+`.wrap('?')} 
        ${_`[eE] [-+]? [0-9]+`.wrap('?')} 
      `,
      stringWithQuotes: _`
        ${_`"'" ${validFullName} "'"`} 
        | ${_`"\\"" ${validFullName} "\\""`}
      `,
      mandatoryWhitespace: whitespace.wrap('+'),
      optionalRecommendedWhitespace: whitespace.wrap('*'),
      optionalNonRecommendedWhitespace: whitespace.wrap('*'),
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

