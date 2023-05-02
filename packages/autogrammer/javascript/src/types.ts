import type { ContortionistOptions, ModelProtocol, } from "contort";

export type SupportedLanguage =
  'sql' |
  // 'python' | 
  // 'javascript' | 
  'json';

export interface ConstructorOptions<L extends SupportedLanguage> {
  language?: L;
  model?: ContortionistOptions<ModelProtocol>['model'];
}
