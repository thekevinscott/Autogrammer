import {
  describe,
  it,
  expect,
} from 'vitest';
import { isSupportedSyntax } from './type-guards';

describe('isSupportedSyntax', () => {
  it('should return true for supported languages', () => {
    expect(isSupportedSyntax('sql')).toBe(true);
    expect(isSupportedSyntax('json')).toBe(true);
  });

  it('should return false for unsupported languages', () => {
    expect(isSupportedSyntax('java')).toBe(false);
    expect(isSupportedSyntax('c')).toBe(false);
    expect(isSupportedSyntax('c++')).toBe(false);
  })
})
