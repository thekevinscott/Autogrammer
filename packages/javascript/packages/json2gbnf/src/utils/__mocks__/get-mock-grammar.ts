import { vi, } from 'vitest';
import { AddRule, GetConst, } from '../../types.js';
import { type Grammar, } from '../../grammar.js';
export const getMockGrammar = ({
  getConst = vi.fn().mockImplementation((key: string) => key),
  addRule = vi.fn().mockImplementation((key: string) => key),
  fixedOrder = false,
}: {
  getConst?: GetConst;
  fixedOrder?: boolean;
  addRule?: AddRule;
} = {}) => {
  class MockGrammar {
    rules = 'foo';
    addRule = addRule;
    getConst = getConst;
    fixedOrder = fixedOrder;
  }

  return new MockGrammar() as unknown as Grammar;
};

