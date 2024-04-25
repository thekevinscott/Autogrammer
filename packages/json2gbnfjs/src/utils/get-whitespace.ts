import {
  WHITESPACE_KEY,
  WHITESPACE_REPEATING_KEY,
} from "../constants/grammar-keys.js";
import type {
  SchemaParser,
} from "../schema-parser.js";
import { buildArr, } from "./build-arr.js";

export const getWhitespace = (
  parser: SchemaParser,
) => parser.whitespace !== Infinity ? parser.addRule(buildArr(
  parser.whitespace,
  `(${WHITESPACE_KEY})?`
)) : WHITESPACE_REPEATING_KEY;
