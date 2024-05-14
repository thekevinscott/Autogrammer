import {
  vi,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { GrammarBuilder } from './Grammar-Builder.js';
import { getConstKey } from './utils/get-const-key.js';
import { getConstRule } from './utils/get-const-rule.js';
import { buildGrammar } from './utils/build-grammar.js';
import { getID } from './utils/get-id.js';
import * as _getID from './utils/get-id.js';
import * as _buildGrammar from './utils/build-grammar.js';

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

describe('GrammarBuilder', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default options', () => {
    const grammar = new GrammarBuilder();
    expect(grammar.whitespace).toBe(1);
  });

  it('should initialize with provided options', () => {
    const grammar = new GrammarBuilder({ whitespace: 2, });
    expect(grammar.whitespace).toBe(2);
  });

  it('should throw an error if whitespace is less than 0', () => {
    expect(() => new GrammarBuilder({ whitespace: -1 })).toThrowError(
      'Whitespace must be greater than or equal to 0. It can also be Infinity.'
    );
  });

  describe('getConst', () => {
    it('should return the key if whitespace is 0', () => {
      const grammar = new GrammarBuilder({ whitespace: 0 });
      const result = grammar.getConst('KEY');
      expect(result).toBe('KEY');
      expect(getConstRule).not.toHaveBeenCalled();
      expect(getConstKey).not.toHaveBeenCalled();
    });

    it('should call getConstRule and getConstKey if whitespace is not 0', () => {
      const grammar = new GrammarBuilder({ whitespace: 1 });
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
      const grammar = new GrammarBuilder();
      const result = grammar.addRule('RULE', 'KEY');
      expect(result).toBe('KEY');
    });

    it('should generate a key if not provided', () => {
      const grammar = new GrammarBuilder();
      vi.mocked(getID).mockReturnValueOnce('0');
      const result = grammar.addRule('RULE');
      expect(result).toBe('x0');
    });
  });

  describe('grammar', () => {
    it('should return the built grammar', () => {
      const grammar = new GrammarBuilder();
      grammar.addRule('RULE1', 'KEY1');
      grammar.addRule('RULE2', 'KEY2');
      vi.mocked(buildGrammar).mockReturnValueOnce('GRAMMAR');
      const result = grammar.grammar;
      expect(result).toBe('GRAMMAR');
    });
  });
});

