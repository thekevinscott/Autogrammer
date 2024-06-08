import {
  describe,
  test,
  expect,
} from 'vitest';
import {
  getSelectRuleWithUnion,
} from './index.js';
import {
  $,
  _,
} from 'gbnf/builder';
import GBNF from 'gbnf';

describe('select', () => {
  test.each([
    'SELECT',
    'select',
    'SELECT foo FROM table',
    'SELECT 1 FROM table',
    'SELECT (SELECT bar FROM table2) FROM table',
    'SELECT (SELECT (SELECT baz FROM table3) FROM table2) FROM table',
    // you spent so much time wondering if you could, you never stopped to think if you should
    'SELECT (SELECT (SELECT (SELECT qux FROM table4) FROM table3) FROM table2) FROM table',
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const whitespace = _`[ \\n\\r]`;
    const grammar = getSelectRuleWithUnion({
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

