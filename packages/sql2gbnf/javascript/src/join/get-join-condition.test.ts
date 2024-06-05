import {
  describe,
  test,
  expect,
} from 'vitest';
import GBNF, { InputParseError } from "gbnf";
import {
  // getEquijoinCondition, 
  getJoinCondition,
} from './get-join-condition.js';

describe('getJoinClause', () => {
  const grammar = getJoinCondition({
    whitespace: 'ws',
    optionalNonRecommendedWhitespace: 'optnws',
    equijoinCondition: 'validName ws "=" ws validName',
  });
  test.each([
    'table1.col1 = table2.col2',
    'table1.col1 = table2.col2',
    'table1.col1 = table2.col2',
    '(table1.col1 = table2.col2)',
    '( table1.col1 = table2.col2 )',
    'table1.col1 = table2.col2 AND table1.col1 = table2.col2',
    'table1.col1 = table2.col2 OR table1.col1 = table2.col2',
  ])('it parses schema to grammar with input "%s"', (initial) => {
    const fullGrammar = [
      grammar.compile(),
      `joinType ::= ("INNER "|"LEFT "|"RIGHT "|"OUTER "|"FULL OUTER ")`,
      `ws ::= (" " | "\n" | "\t")+`,
      `optws ::= (" " | "\n" | "\t")*`,
      `optnws ::= optws`,
      `validName ::= ([a-zA-Z1-9_.])+`,
    ].join('\n')
    // console.log(fullGrammar);
    let parser = GBNF(fullGrammar);
    parser = parser.add(initial.split('\\n').join('\n').split('\\t').join('\t'));
    expect(parser.size).toBeGreaterThan(0);
  });

  test.each([
    ['(table1.col1 = table2.col2;', 26],
    ['table1.col1 = table2.col2);', 25],
    [`foo = foo and bar = bar or baz = bz`, 10],
  ])('it raises on bad input %s', (_initial, errorPos) => {
    const fullGrammar = [
      grammar.compile(),
      `joinType ::= ("INNER "|"LEFT "|"RIGHT "|"OUTER "|"FULL OUTER ")`,
      `ws ::= (" " | "\n" | "\t")+`,
      `optws ::= (" " | "\n" | "\t")*`,
      `optnws ::= optws`,
      `validName ::= ([a-zA-Z1-9_.])+`,
    ].join('\n')
    // console.log(fullGrammar);
    let parser = GBNF(fullGrammar);
    const initial = _initial.split('\\n').join('\n');
    expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, errorPos));
  });

});


