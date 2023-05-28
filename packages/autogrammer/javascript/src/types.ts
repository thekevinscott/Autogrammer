import type { ContortionistOptions, ModelProtocol, } from "contort";
import type {
  JSONSchema,
  SchemaOpts as JSONSchemaOpts,
} from 'json2gbnf';
import type {
  DBMLSchemaOpts,
  SchemaOpts as SQLSchemaOpts,
} from 'sql2gbnf';

export type SupportedLanguage =
  'sql' |
  // 'python' | 
  // 'javascript' | 
  'json';

export interface ConstructorOptions<L extends SupportedLanguage> {
  language?: L;
  model?: ContortionistOptions<ModelProtocol>['model'];
}

export interface SQLLanguageOptions {
  schema?: DBMLSchemaOpts;
  options?: SQLSchemaOpts;
}

export interface JSONLanguageOptions {
  schema?: JSONSchema;
  options?: JSONSchemaOpts;
}
export type LanguageOptions<L extends SupportedLanguage> = L extends 'sql' ? SQLLanguageOptions : JSONLanguageOptions;
