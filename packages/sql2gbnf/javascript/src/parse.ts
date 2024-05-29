import { addCasedWords, } from "./utils/add-cased-words.js";
import {
  GrammarBuilder,
  join,
  $,
  $o,
  $r,
  GBNFRule,
} from "gbnf/builder";
import {
  select as getSelectRule,
} from "./select/index.js";
import type {
  CaseKind,
  Database,
  WhitespaceKind,
} from "./types.js";
import {
  insert as getInsertRule,
} from "./insert/index.js";
import { any, } from "./utils/any.js";
import {
  ANY_VALID_STRING_VALUE_IN_QUOTES,
  INSERT_RULE,
  SELECT_QUERY_WITH_UNION,
  STRING_WITH_DOUBLE_QUOTES,
  STRING_WITH_QUOTES,
  STRING_WITH_SINGLE_QUOTES,
  VALID_FULL_NAME,
  VALID_NAME,
} from "./gbnf-keys.js";
import {
  DOUBLE_QUOTE_KEY,
  SINGLE_QUOTE_KEY,
} from "./constants/grammar-keys.js";
import { getWhitespaceDefs, } from "./utils/get-whitespace-def.js";
import { star, } from "./utils/get-star.js";
import { validNameDef, } from "./constants/grammar-definitions.js";

export const parse = (
  parser: GrammarBuilder,
  opts: {
    whitespace: WhitespaceKind;
    case: CaseKind,
  },
  database: void | Database,
  // schema?: string,
): GBNFRule => {
  const KEYS = addCasedWords(parser, opts.case);
  const anyValidStringValueInQuotes = parser.addRule('[^\'\\"]+', ANY_VALID_STRING_VALUE_IN_QUOTES);
  const stringWithSingleQuotesKey = parser.addRule(join(
    SINGLE_QUOTE_KEY,
    anyValidStringValueInQuotes,
    SINGLE_QUOTE_KEY,
  ), STRING_WITH_SINGLE_QUOTES);
  const stringWithDoubleQuotesKey = parser.addRule(join(
    DOUBLE_QUOTE_KEY,
    anyValidStringValueInQuotes,
    DOUBLE_QUOTE_KEY,
  ), STRING_WITH_DOUBLE_QUOTES);
  const stringWithQuotes = parser.addRule(`(${any(
    stringWithSingleQuotesKey,
    stringWithDoubleQuotesKey,
  )})`, STRING_WITH_QUOTES);

  const validName = parser.addRule(validNameDef, VALID_NAME);
  const validFullName = parser.addRule(join(
    validName,
    star(
      '"."',
      validName,
    ),
  ), VALID_FULL_NAME);
  const {
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  } = getWhitespaceDefs(parser, opts.whitespace);

  const selectRule = parser.addRule(getSelectRule(parser, KEYS, opts, database, {
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
    withUnion: true,
  }), SELECT_QUERY_WITH_UNION);

  const insertRule = parser.addRule(getInsertRule(parser, KEYS, opts, database, {
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
  }), INSERT_RULE);
  // const _optionalNonRecommendedWhitespace = opts.whitespace === 'verbose' ? $o`${$r`" "`}` : undefined;
  const _optionalNonRecommendedWhitespace = opts.whitespace === 'verbose' ? $o`
  ---
  raw: true
  ---
  ws` : undefined;
  // "\\\\x20" | "\\\\x0A" | "\\\\x09"` : undefined;
  //   '\r'   // carriage return - \x0D
  // '\v'   // vertical tab    - \x0B 
  // '\f'   // form feed       - \x0C
  // '\u2028' // line separator
  // '\u2029' // paragraph separator
  return $`
    ${$r`${selectRule} | ${insertRule}`}
    ${$o`${_optionalNonRecommendedWhitespace};`}
  `;
};

// if a raw string, whitespace is thrown away (not treated as special)
// if _not_ a raw string, whitespace is stringified
