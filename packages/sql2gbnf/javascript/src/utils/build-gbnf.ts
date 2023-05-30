import {
  type GrammarBuilder,
  // buildGBNF as _buildGBNF,
} from "gbnf/builder-v2";
import {
  joinWith,
  // buildGBNF as _buildGBNF,
  GLOBAL_CONSTANTS as _GLOBAL_CONSTANTS,
} from "gbnf/builder-v1";
import {
  GLOBAL_CONSTANTS,
} from "../constants/constants.js";

export const buildGBNF = (parser: GrammarBuilder) => {
  return joinWith('\n',
    ...[...parser.grammar,].sort(),
    ..._GLOBAL_CONSTANTS,
    ...GLOBAL_CONSTANTS,
  );
};
