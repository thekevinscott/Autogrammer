import { isLanguage } from './get-grammar.js';
describe('isLanguage', () => {
  test('isLanguage returns true when the language is the same as the testing language', () => {
    expect(isLanguage('sql', 'sql')).toBe(true);
  });

  test('isLanguage returns false when the language is not the same as the testing language', () => {
    expect(isLanguage('sql', 'json')).toBe(false);
  });
});
