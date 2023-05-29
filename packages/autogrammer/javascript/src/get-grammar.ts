import JSON2GBNF from 'json2gbnf';
import SQL2GBNF from 'sql2gbnf';
import type {
  LanguageOptions,
  SupportedLanguage,
  SQLLanguageOptions,
  JSONLanguageOptions,
} from "./types.js";

const GRAMMARS = {
  json: ({ schema, options, }: JSONLanguageOptions) => JSON2GBNF(schema, {
    fixedOrder: false,
    whitespace: 1,
    ...options,
  }),
  sql: ({ options, }: SQLLanguageOptions) => SQL2GBNF({
    whitespace: 'succinct',
    case: 'upper',
    ...options,
  }),
};

export function getGrammar<L extends SupportedLanguage>(
  language: L,
  languageOptions: LanguageOptions<L> = {},
): string {
  return GRAMMARS[language](languageOptions as JSONLanguageOptions & SQLLanguageOptions);
}
