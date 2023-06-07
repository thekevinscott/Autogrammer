import {
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import {
  getRuleNames,
} from './get-rule-names.js';
import { GrammarBuilder } from './grammar-builder.js';
import {
  _,
} from '../builder-v2/template-tags.js';

// class MockGrammarBuilder {
//   #rules: Map<string, string>;
//   #keys: Set<string>;

//   addRule = (
//     rule,
//     key,
//   ) => {
//     return key;
//   }
//   public get grammar(): IterableIterator<string> {
//     return (function* () {
//       yield '1';
//     })();
//   }
// }

// const mockGrammarBuilder = new MockGrammarBuilder() as unknown as GrammarBuilder
const parser = new GrammarBuilder();

describe('getRuleNames', () => {
  test('it gets rule names for strings', () => {
    expect(getRuleNames(
      ['a', 'b'],
      parser,
      'default',
    )).toEqual(['a', 'b']);
  });

  test('it gets rule names for rules', () => {
    expect(getRuleNames(
      [_`a`.key('a1'), _`b`.key('b1')],
      parser,
      'default',
    )).toEqual(['a1', 'b1']);
  });

  test('it skips undefined', () => {
    expect(getRuleNames(
      ['a', undefined, 'b'],
      parser,
      'default',
    )).toEqual(['a', 'b']);
  });

  test('it returns a mixed group', () => {
    expect(getRuleNames(
      ['foo', _`a`.key('a1'), undefined, _`b`.key('b1')],
      parser,
      'default',
    )).toEqual(['foo', 'a1', 'b1']);
  });

  describe('arrays', () => {
    test.each([
      // [
      //   [[_`c`.key('c1'), _`d`.key('d1')]],
      //   ['x'],
      //   [
      //     'c1 ::= c',
      //     'd1 ::= d',
      //     'x ::= c1 d1',
      //   ],
      // ],
      [
        [
          'foo',
          _`a`.key('a1'),
          undefined,
          [
            _`c`.key('c1'),
            _`d`.key('d1'),
          ],
          _`b`.key('b1'),
        ],
        ['foo', 'a1', 'x', 'b1'],
        [
          'a1 ::= a',
          'b1 ::= b',
          'c1 ::= c',
          'd1 ::= d',
          'x ::= c1 d1',
        ],
      ],

    ])(`(array) it handles '%s'`, (rules, expectation, grammar) => {
      const ruleNames = getRuleNames(
        rules,
        parser,
        'default',
      );
      expect(ruleNames.sort()).toEqual(expectation.sort());
      expect([...parser.grammar].sort()).toEqual(grammar.sort());
    });
  });
});
