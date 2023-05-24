import { addCasedWords, } from "./utils/add-cased-words.js";
import {
  GrammarBuilder,
} from "gbnf";
import { select, } from "./select/index.js";
import type {
  CaseKind,
  Database,
  WhitespaceKind,
} from "./types.js";

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
  const selectKey = select(parser, KEYS, opts, database);
  const root = `${selectKey}`;
  parser.addRule(root, symbolName);
};
