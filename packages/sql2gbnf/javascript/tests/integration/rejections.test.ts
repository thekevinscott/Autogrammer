import {
  describe,
  test,
  expect,
} from 'vitest';
import {
  SQL2GBNF,
} from '../../src/sql2gbnf.js';
import GBNF, {
  InputParseError,
} from 'gbnf';

describe('Rejections, no schema', () => {
  test.each([
    ['1', 0],
    ['select;', 6],
    ['select 1', 7],
    ['select .', 7],
    [`SELECT INTO newtable column1, column2 INTO newtable FROM sourcetable;`, 38],
  ])('it rejects %s for a non-schema', (_initial, errorPos) => {
    const grammar = SQL2GBNF();
    let parser = GBNF(grammar);
    const initial = _initial.split('\\n').join('\n');
    expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, errorPos));
  });
});

