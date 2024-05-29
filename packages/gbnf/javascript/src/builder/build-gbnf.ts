import { GrammarBuilder, } from "./Grammar-Builder.js";
import { GBNFRule, } from "./rule/index.js";
import { joinWith, } from "./utils/join.js";

export const buildGBNF = (parser: GrammarBuilder, gbnf: GBNFRule) => {
  parser.addRule(gbnf.toString(), 'root');
  return joinWith('\n',
    ...[...parser.grammar,].sort(),
  );
};

