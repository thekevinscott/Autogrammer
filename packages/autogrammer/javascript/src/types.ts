import type {
  ContortionistOptions,
  ModelProtocol,
} from "contort";
import type {
  JSONSchema,
  SchemaOpts as JSONSchemaOpts,
} from 'json2gbnf';
import type {
  DBMLSchemaOpts,
  SchemaOpts as SQLSchemaOpts,
} from 'sql2gbnf';

export type SupportedSyntax =
  'sql' |
  'json';

export interface ConstructorOptions<L extends SupportedSyntax> {
  syntax?: L;
  model?: ContortionistOptions<ModelProtocol>['model'];
}

export interface SQLSyntaxOptions {
  schema?: DBMLSchemaOpts;
  options?: SQLSchemaOpts;
}

export interface JSONSyntaxOptions {
  schema?: JSONSchema;
  options?: JSONSchemaOpts;
}
export type LanguageOptions<L extends SupportedSyntax> = L extends 'sql' ? SQLSyntaxOptions : JSONSyntaxOptions;
