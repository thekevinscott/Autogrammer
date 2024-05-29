import {
  type GrammarBuilder,
  joinWith,
} from "gbnf";
import {
  GLOBAL_CONSTANTS,
} from "../constants/constants.js";
import {
  GBNFRule,
} from "./rule.js";

export const buildGBNF = (parser: GrammarBuilder, gbnf: GBNFRule) => {
  parser.addRule(gbnf.toString(), 'root');
  return joinWith('\n',
    ...[...parser.grammar,].sort(),
    ...GLOBAL_CONSTANTS,
  );
};
