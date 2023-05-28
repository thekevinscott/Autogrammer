import { addCasedWords, } from "./utils/add-cased-words.js";
import {
  GrammarBuilder,
  join,
} from "gbnf";
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
  SEMI_KEY,
  SINGLE_QUOTE_KEY,
} from "./constants/grammar-keys.js";
import { opt, } from "./utils/get-optional.js";
import { getWhitespaceDefs, } from "./utils/get-whitespace-def.js";
import { star, } from "./utils/get-star.js";
import { validNameDef, } from "./constants/grammar-definitions.js";

export const parse = (
  parser: GrammarBuilder,
  symbolName: string,
  opts: {
    whitespace: WhitespaceKind;
    case: CaseKind,
  },
  database: void | Database,
  // schema?: string,
) => {
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
  const root = join(
    any(
      selectRule,
      insertRule,
    ),
    opt(optionalNonRecommendedWhitespace, SEMI_KEY),
  );
  parser.addRule(root, symbolName);
};
