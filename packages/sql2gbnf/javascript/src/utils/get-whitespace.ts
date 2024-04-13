import {
  WHITESPACE_KEY,
  WHITESPACE_REPEATING_KEY,
} from "../constants/grammar-keys.js";
import type {
  Grammar,
} from "../grammar.js";
import { buildArr, } from "./build-arr.js";

export const getWhitespace = (
  parser: Grammar,
) => parser.whitespace !== Infinity ? parser.addRule(buildArr(
  parser.whitespace,
  `(${WHITESPACE_KEY})?`
)) : WHITESPACE_REPEATING_KEY;

