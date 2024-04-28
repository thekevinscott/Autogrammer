import { Grammar, } from "../grammar.js";
import { getWhitespace, } from "./get-whitespace.js";
import { join, } from "./join.js";

export const getConstRule = (
  parser: Grammar,
  key: string,
  left: boolean,
  right: boolean,
): string => join(
  left ? getWhitespace(parser) : undefined,
  key,
  right ? getWhitespace(parser) : undefined,
);
