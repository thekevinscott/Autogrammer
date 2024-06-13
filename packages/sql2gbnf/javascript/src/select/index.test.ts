import {
  describe,
  test,
  expect,
} from 'vitest';
import {
  selectRuleWithUnion,
} from './index.js';
import {
  $,
  _,
} from 'gbnf/builder';
import GBNF from 'gbnf';
import {
  include,
} from '../__fixtures__/includes.js';


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
    let parser = GBNF([
      selectRuleWithUnion.compile({
        include,
        caseKind: 'any',
      }),
    ].join('\n'));
    parser = parser.add(initial.split('\\n').join('\n'));
    expect(parser.size).toBeGreaterThan(0);
  });
});

