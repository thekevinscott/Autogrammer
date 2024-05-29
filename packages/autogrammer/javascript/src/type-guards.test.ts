import {
  describe,
  it,
  expect,
} from 'vitest';
import { isSupportedLanguage } from './type-guards';

describe('isSupportedLanguage', () => {
  it('should return true for supported languages', () => {
    expect(isSupportedLanguage('sql')).toBe(true);
    expect(isSupportedLanguage('json')).toBe(true);
  });

  it('should return false for unsupported languages', () => {
    expect(isSupportedLanguage('java')).toBe(false);
    expect(isSupportedLanguage('c')).toBe(false);
    expect(isSupportedLanguage('c++')).toBe(false);
  })
})
