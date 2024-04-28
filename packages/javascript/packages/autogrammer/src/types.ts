import type { ContortionistOptions, } from "contort";

export type SupportedLanguage =
  'sql' |
  // 'python' | 
  // 'javascript' | 
  'json';
export const SUPPORTED_LANGUAGES = [
  'sql',
  // 'python', 
  // 'javascript', 
  'json',
];

export const isSupportedLanguage = (language: string): language is SupportedLanguage => SUPPORTED_LANGUAGES.includes(language);

export interface ConstructorOptions<L extends SupportedLanguage> {
  language: L;
  model: ContortionistOptions<undefined>['model'];
}
