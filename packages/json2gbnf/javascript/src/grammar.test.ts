import { Grammar } from './grammar.js';
import { getConstKey } from './utils/get-const-key.js';
import { getConstRule } from './utils/get-const-rule.js';
import { buildGrammar } from './utils/build-grammar.js';
import { getID } from './utils/get-id.js';
import * as _getID from './utils/get-id.js';
import * as _buildGrammar from './utils/build-grammar.js';
import { vi } from 'vitest';

vi.mock('./utils/get-const-key.js');
vi.mock('./utils/get-const-rule.js');
vi.mock('./utils/build-grammar.js', async () => {
  const actual = await vi.importActual('./utils/build-grammar.js') as typeof _buildGrammar;
  return {
    ...actual,
    buildGrammar: vi.fn((rules) => rules),
  };
});
vi.mock('./utils/get-id.js', async () => {
  const actual = await vi.importActual('./utils/get-id.js') as typeof _getID;
  return {
    ...actual,
    getID: vi.fn((id) => id),
  };
});

describe('Grammar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default options', () => {
    const grammar = new Grammar();
    expect(grammar.whitespace).toBe(1);
    expect(grammar.fixedOrder).toBe(false);
  });

  it('should initialize with provided options', () => {
    const grammar = new Grammar({ whitespace: 2, fixedOrder: true });
    expect(grammar.whitespace).toBe(2);
    expect(grammar.fixedOrder).toBe(true);
  });

  it('should throw an error if whitespace is less than 0', () => {
    expect(() => new Grammar({ whitespace: -1 })).toThrowError(
      'Whitespace must be greater than or equal to 0. It can also be Infinity.'
    );
  });

  describe('getConst', () => {
    it('should return the key if whitespace is 0', () => {
      const grammar = new Grammar({ whitespace: 0 });
      const result = grammar.getConst('KEY');
      expect(result).toBe('KEY');
      expect(getConstRule).not.toHaveBeenCalled();
      expect(getConstKey).not.toHaveBeenCalled();
    });

    it('should call getConstRule and getConstKey if whitespace is not 0', () => {
      const grammar = new Grammar({ whitespace: 1 });
      vi.mocked(getConstRule).mockReturnValueOnce('CONST_RULE');
      vi.mocked(getConstKey).mockReturnValueOnce('CONST_KEY');
      const result = grammar.getConst('KEY', { left: true, right: false });
      expect(result).toBe('CONST_KEY');
      expect(getConstRule).toHaveBeenCalledWith(grammar, 'KEY', true, false);
      expect(getConstKey).toHaveBeenCalledWith('KEY', true, false);
    });
  });

  describe('addRule', () => {
    it('should add a rule with the provided key', () => {
      const grammar = new Grammar();
      const result = grammar.addRule('RULE', 'KEY');
      expect(result).toBe('KEY');
    });

    it('should generate a key if not provided', () => {
      const grammar = new Grammar();
      vi.mocked(getID).mockReturnValueOnce('0');
      const result = grammar.addRule('RULE');
      expect(result).toBe('x0');
    });
  });

  describe('grammar', () => {
    it('should return the built grammar', () => {
      const grammar = new Grammar();
      grammar.addRule('RULE1', 'KEY1');
      grammar.addRule('RULE2', 'KEY2');
      vi.mocked(buildGrammar).mockReturnValueOnce('GRAMMAR');
      const result = grammar.grammar;
      expect(result).toBe('GRAMMAR');
    });
  });
});
