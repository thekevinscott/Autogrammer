import {
  type GrammarBuilder,
  type GBNFRule,
  joinWith,
  buildGBNF as _buildGBNF,
} from "gbnf/builder";
import {
  GLOBAL_CONSTANTS,
} from "../constants/constants.js";

export const buildGBNF = (parser: GrammarBuilder, gbnf: GBNFRule) => {
  return joinWith('\n',
    _buildGBNF(parser, gbnf),
    ...GLOBAL_CONSTANTS,
  );
};
