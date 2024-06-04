import {
  describe,
  test,
  it,
  expect,
} from 'vitest';

import {
  $,
  _,
} from './index.js';
import { CaseKind } from './types.js';

describe('scratch', () => {
  test.each([
    ['root ::= [a-z]', _`[a-z]`],
    ['root ::= [a-z]', _` [a-z]`],
    ['root ::= [a-z]', _`[a-z] `],
    ['root ::= [a-z]', _` [a-z] `],
    ['root ::= [a-z]', _`\n[a-z]`],
    ['root ::= [a-z]', _`[a-z]\n`],
    ['root ::= [a-z]', _`\n[a-z]\n`],
    ['root ::= [a-z]', _`\t[a-z]`],
    ['root ::= [a-z]', _`[a-z]\t`],
    ['root ::= [a-z]', _`\t[a-z]\t`],
    ['root ::= [a-z] [a-z]', _` [a-z]  [a-z] `],
    ['root ::= [a-z] [a-z] [a-z]', _` [a-z]   [a-z] \n\n\t\n  [a-z] `],
    ['root ::= " foo "', _`" foo "`],
    ['root ::= [a-z] [a-z] " foo "', _` [a-z]  [a-z] " foo "`],
    ['root ::= [a-z] [a-z] "  foo  "', _` [a-z]  [a-z] "  foo  "`],
    ['root ::= [a-z] [a-z] "  \\nfoo\\n  "', _` [a-z]  [a-z] "  \nfoo\n  "`],
    ['root ::= [a-z] [a-z] "  \\n\\tfoo\\t\\n  "', _` [a-z]  [a-z] "  \n\tfoo\t\n  "`],
    ['root ::= " \\" foo"', _`" \\" foo"`],
    ['root ::= " \\" foo\\""', _`" \\" foo\\""`],
    ['root ::= " \\" \\nfoo\\""', _`" \\" \nfoo\\""`],
    ['root ::= " \\" \\n\\t  foo\\""', _`" \\" \n\t  foo\\""`],
    ['root ::= [a-z] [a-z] "  foo\\n \\" \\tBAR\\""', _` [a-z]  [a-z] "  foo\n \\" \tBAR\\""`],

    ['root ::= "SELECT"', $`SELECT`],
    ['root ::= "SELECT "', $`SELECT `],
    ['root ::= "  SELECT  FOO  "', $`  SELECT  FOO  `],
    ['root ::= "  SELECT  \\nFOO  "', $`  SELECT  \nFOO  `],
    ['root ::= "  SELECT  \\tFOO  "', $`  SELECT  \tFOO  `],
  ])(`(singleline) '%s'`, (_expectation, rule) => {
    const expectation = _expectation.replace(/\\t/g, '\t').split('\n').sort().join('\n');
    expect(rule.compile()).toEqual(expectation);
  });

  test.each([
    [
      [
        'root ::= [a-z] x',
        'x ::= "FOO"',
      ].join('\\n'),
      _`[a-z] ${$`FOO`}`,
    ],
    [
      [
        'root ::= [a-z] x',
        'x ::= "FOO"',
      ].join('\\n'),
      _` \n[a-z] \n${$`FOO`}`,
    ],
    [
      [
        'root ::= [a-z] x x',
        'x ::= [A-B]',
      ].join('\\n'),
      _` [a-z] ${_`[A-B]`} ${_`[A-B]`}`,
    ],
    [
      [
        'root ::= [a-z] x',
        'x ::= [A-Z]',
      ].join('\\n'),
      _` [a-z] ${_`[A-Z]`}`,
    ],
    [
      [
        'root ::= [a-z] x x',
        'x ::= [A-Z]',
      ].join('\\n'),
      _` [a-z] ${_`[A-Z]`} ${_`[A-Z]`}`,
    ],
    // rules with extra spaces should resolve to the same rule
    [
      [
        'root ::= [a-z] x x',
        'x ::= [A-Z]',
      ].join('\\n'),
      _` [a-z] ${_` \n\t[A-Z]`} ${_`[A-Z] \n\t`}`,
    ],

    // rules can be named
    [
      [
        'root ::= [a-z] uppercase',
        'uppercase ::= [A-Z]',
      ].join('\\n'),
      _` [a-z] ${_.key('uppercase')`[A-Z]`}`,
    ],
    [
      [
        'root ::= " FOO " bar',
        'bar ::= "ZZZ"',
      ].join('\\n'),
      $` FOO ${$.key('bar')`ZZZ`}`,
    ],
    [
      [
        'root ::= x x-a',
        'x ::= [a-z]',
        'x-a ::= [ a-z]',
      ].join('\\n'),
      _`${_`[a-z]`} ${_`[ a-z]`}`,
    ],
    [
      [
        'root ::= az az-a',
        'az ::= [a-z]',
        'az-a ::= [ a-z]',
      ].join('\\n'),
      _`${_.key('az')`[a-z]`} ${_.key('az')`[ a-z]`}`,
    ],
    [
      [
        'root ::= az az-a az-b',
        'az ::= [a-z]',
        'az-a ::= [ a-z]',
        'az-b ::= [ a-z ]',
      ].join('\\n'),
      _`${_.key('az')`[a-z]`} ${_.key('az')`[ a-z]`} ${_.key('az')`[ a-z ]`}`,
    ],

    [
      [
        'root ::= x',
        'x ::= (" ")',
      ].join('\\n'),
      _`${_`(" ")`}`,
    ],
    [
      [
        'root ::= x',
        'x ::= " "',
      ].join('\\n'),
      _`${_`" "`}`,
    ],
  ])(`(multiline) '%s'`, (_expectation, rule) => {
    const expectation = _expectation.replace(/\\n/g, '\n').replace(/\\t/g, '\t').split('\n').sort().join('\n');
    expect(rule.compile()).toEqual(expectation);
  });

  test.each([
    [
      [
        'root ::= x column-name x-a x-b',
        'column-name ::= ("*" | [a-z])',
        'x ::= "SELECT "',
        'x-b ::= [a-z]',
        'x-a ::= " FROM "',
      ].join('\\n'),
      _`
      ${$`SELECT `}
      ${_.key('column-name')`("*" | [a-z])`}
      ${$` FROM `}
      ${_`[a-z]`}
      `,
    ],
  ])(`(complicated) '%s'`, (_expectation, rule) => {
    const expectation = _expectation.replace(/\\n/g, '\n').replace(/\\t/g, '\t').split('\n').sort().join('\n');
    expect(rule.compile()).toEqual(expectation);
  });

  test.each([
    [
      _`${_.key('a')`"A"`}${_.key('b')`"A"`}`,
    ],
  ])('(errors) expect to throw', (rule) => {
    expect(() => rule.compile()).toThrow();
  });

  test.each([
    ['root ::= "SELect"', 'default' as CaseKind, $`SELect`],
    ['root ::= "SELECT"', 'upper' as CaseKind, $`SELect`],
    ['root ::= "select"', 'lower' as CaseKind, $`SELect`],
    ['root ::= [sS] [eE] [lL] [eE] [cC] [tT]', 'any' as CaseKind, $`SELect`],
  ])(`(cases) '%s'`, (_expectation, caseKind, rule) => {
    const expectation = _expectation.replace(/\\t/g, '\t').split('\n').sort().join('\n');
    expect(rule.compile({ caseKind })).toEqual(expectation);
  });
});
