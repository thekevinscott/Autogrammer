import {
  vi,
  describe,
  test,
  expect,
} from 'vitest';
import GBNF, { InputParseError } from "gbnf";
import { getJoinClause, } from "./get-join-clause.js";
import {
  _,
  $,
} from 'gbnf/builder';
import {
  getWhereClauseInner
} from '../select/get-where-clause-inner.js';

// import {
//   getJoinCondition,
// } from './get-join-condition.js';
import * as _getJoinCondition from './get-join-condition.js';

vi.mock('./get-join-condition.js', async () => {
  const actual = await vi.importActual('./get-join-condition.js') as typeof _getJoinCondition;
  return {
    ...actual,
    getJoinCondition: vi.fn(() => $`GET_JOIN_CONDITION`),
  };
});

describe('getJoinClause', () => {
  const ws = _`[ \\n\\r]`;
  const rule = getJoinClause({
    ws: ws.wrap('+'),
    optNonRecWS: ws.wrap('*'),
    whereClauseInner: getWhereClauseInner({
      ws: ws.wrap('+'),
      optRecWS: ws.wrap('*'),
      optNonRecWS: ws.wrap('*'),
    }),
  });
  test.each([
    'join',
    'inner \\njoin',
    'left \\njoin',
    'right \\njoin',
    'full \\njoin',
    'full \\nouter join',
    'left \\ninner\\njoin',
    'left \\nouter\\njoin',
    'right \\nouter\\njoin',
    'right \\ninner\\njoin',
    'JOIN table1 ON ',
    'INNER JOIN table1 ON ',
    'INNER JOIN table1 ON \\n\\n ',
    'INNER JOIN table1  \\n\\nON ',
  ])('it parses schema to grammar with input "%s"', (initial) => {
    let parser = GBNF(rule.compile({
      caseKind: 'any',
    }));
    parser = parser.add(initial.split('\\n').join('\n'));
    expect(parser.size).toBeGreaterThan(0);
  });

  test.each([
    ['INNER FULL JOIN table1 ON ', 6],
    ['INNER left JOIN table1 ON ', 6],
    ['INNER right JOIN table1 ON ', 6],
    ['outer right JOIN table1 ON ', 6],
    ['outer left JOIN table1 ON ', 6],
  ])('it raises on bad input %s', (_initial, errorPos) => {
    // console.log(fullGrammar);
    let parser = GBNF(rule.compile({
      caseKind: 'any',
    }));
    const initial = _initial.split('\\n').join('\n').trim();
    expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, errorPos));
  });
});
