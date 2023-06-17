import JSON2GBNF from 'json2gbnf';
import SQL2GBNF from 'sql2gbnf';
import type {
  LanguageOptions,
  SupportedSyntax,
  SQLSyntaxOptions,
  JSONSyntaxOptions,
} from "./types.js";

const GRAMMARS = {
  json: ({ schema, options, }: JSONSyntaxOptions) => JSON2GBNF(schema, {
    fixedOrder: false,
    // whitespace: 1,
    ...options,
  }),
  sql: ({ options, }: SQLSyntaxOptions) => SQL2GBNF({
    whitespace: 'succinct',
    case: 'upper',
    ...options,
  }),
};

export function getGrammar<L extends SupportedSyntax>(
  language: L,
  languageOptions: LanguageOptions<L> = {},
): string {
  return GRAMMARS[language](languageOptions as JSONSyntaxOptions & SQLSyntaxOptions);
}
