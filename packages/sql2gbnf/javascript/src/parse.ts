import { addCasedWords, } from "./utils/add-cased-words.js";
import {
  join,
} from "gbnf/builder-v1";
import {
  _,
  GrammarBuilder,
} from "gbnf/builder-v2";
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
  INSERT_RULE,
  SELECT_QUERY_WITH_UNION,
  STRING_WITH_QUOTES,
  VALID_FULL_NAME,
} from "./gbnf-keys.js";
import {
  SEMI_KEY,
} from "./constants/grammar-keys.js";
import { getWhitespaceDefs, } from "./utils/get-whitespace-def.js";
import { opt, } from "./utils/get-optional.js";
import { addShorthand, } from "./add-shorthand.js";

export const parse = (
  parser: GrammarBuilder,
  opts: {
    whitespace: WhitespaceKind;
    case: CaseKind,
  },
  database: void | Database,
  // schema?: string,
): string => {
  // parser.addRule('[^\'\\"]+', ANY_VALID_STRING_VALUE_IN_QUOTES);
  // parser.addRule(join(
  //   SINGLE_QUOTE_KEY,
  //   ANY_VALID_STRING_VALUE_IN_QUOTES,
  //   SINGLE_QUOTE_KEY,
  // // ), STRING_WITH_SINGLE_QUOTES);
  // parser.addRule(join(
  //   DOUBLE_QUOTE_KEY,
  //   ANY_VALID_STRING_VALUE_IN_QUOTES,
  //   DOUBLE_QUOTE_KEY,
  // ), STRING_WITH_DOUBLE_QUOTES);
  // parser.addRule(`(${any(
  //   STRING_WITH_SINGLE_QUOTES,
  //   STRING_WITH_DOUBLE_QUOTES,
  // )})`, STRING_WITH_QUOTES);
  const validString = _`[^\'\\"]+`;
  addShorthand(_.key(STRING_WITH_QUOTES)`
  (
    ${_`"'" ${validString} "'"`} | ${_`"\\"" ${validString} "\\""`}
  )`, parser);

  const validName = _`[a-zA-Z_] [a-zA-Z0-9_]*`;

  addShorthand(_.key(VALID_FULL_NAME)`
  ${validName}
  ("." ${validName})*
  `, parser);

  const {
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
  } = getWhitespaceDefs(parser, opts.whitespace);

  const KEYS = addCasedWords(parser, opts.case);
  const selectRule = parser.addRule(getSelectRule(parser, KEYS, opts, database, {
    validFullName: VALID_FULL_NAME,
    stringWithQuotes: STRING_WITH_QUOTES,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
    withUnion: true,
  }), SELECT_QUERY_WITH_UNION);

  const insertRule = parser.addRule(getInsertRule(parser, KEYS, opts, database, {
    validFullName: VALID_FULL_NAME,
    stringWithQuotes: STRING_WITH_QUOTES,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
  }), INSERT_RULE);
  return join(
    any(
      selectRule,
      insertRule,
    ),
    opt(optionalNonRecommendedWhitespace, SEMI_KEY),
  );
};

// if a raw string, whitespace is thrown away (not treated as special)
// if _not_ a raw string, whitespace is stringified
