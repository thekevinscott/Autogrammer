import { describe, it, expect, vi, } from 'vitest';
import { getWhitespace, } from './get-whitespace.js';
import {
  WHITESPACE_KEY,
  WHITESPACE_REPEATING_KEY,
} from '../constants/grammar-keys.js';
import type { Grammar, } from '../grammar.js';

describe('getWhitespace', () => {
  let parser: Grammar;

  beforeEach(() => {
    parser = {
      addRule: vi.fn((rule: string) => rule),
      whitespace: 0,
    } as unknown as Grammar;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return WHITESPACE_REPEATING_KEY when whitespace is Infinity', () => {
    parser.whitespace = Infinity;
    const result = getWhitespace(parser);
    expect(result).toBe(WHITESPACE_REPEATING_KEY);
    expect(parser.addRule).not.toHaveBeenCalled();
  });

  it('should return the correct whitespace rule when whitespace is 0', () => {
    parser.whitespace = 0;
    const result = getWhitespace(parser);
    expect(result).toBe('');
    expect(parser.addRule).toHaveBeenCalledWith('');
  });

  it('should return the correct whitespace rule when whitespace is 1', () => {
    parser.whitespace = 1;
    const result = getWhitespace(parser);
    expect(result).toBe(`(${WHITESPACE_KEY})?`);
    expect(parser.addRule).toHaveBeenCalledWith(`(${WHITESPACE_KEY})?`);
  });

  it('should return the correct whitespace rule when whitespace is 2', () => {
    parser.whitespace = 2;
    const result = getWhitespace(parser);
    expect(result).toBe(`(${WHITESPACE_KEY})? (${WHITESPACE_KEY})?`);
    expect(parser.addRule).toHaveBeenCalledWith(`(${WHITESPACE_KEY})? (${WHITESPACE_KEY})?`);
  });

  it('should return the correct whitespace rule when whitespace is 3', () => {
    parser.whitespace = 3;
    const result = getWhitespace(parser);
    expect(result).toBe(`(${WHITESPACE_KEY})? (${WHITESPACE_KEY})? (${WHITESPACE_KEY})?`);
    expect(parser.addRule).toHaveBeenCalledWith(`(${WHITESPACE_KEY})? (${WHITESPACE_KEY})? (${WHITESPACE_KEY})?`);
  });
});
