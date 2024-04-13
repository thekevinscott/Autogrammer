import { vi, describe, afterEach, expect, test } from 'vitest';
import { SQL2GBNF } from "./sql2gbnf.js";

describe('SQL2GBNF', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('it returns a grammar', () => {
    expect(SQL2GBNF()).toEqual('root ::= query');
  });
});
