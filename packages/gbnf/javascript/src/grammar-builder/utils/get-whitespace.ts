import {
  WHITESPACE_KEY,
  WHITESPACE_REPEATING_KEY,
} from "../constants/grammar-keys.js";
import type {
  GrammarBuilder,
} from "../Grammar-Builder.js";
import { buildArr, } from "./build-arr.js";

export const getWhitespace = (
  parser: GrammarBuilder,
) => parser.whitespace !== Infinity ? parser.addRule(buildArr(
  parser.whitespace,
  `(${WHITESPACE_KEY})?`
)) : WHITESPACE_REPEATING_KEY;
