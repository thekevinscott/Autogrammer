import { SchemaParser, } from "../schema-parser.js";
import { getWhitespace, } from "./get-whitespace.js";
import { join, } from "./join.js";

export const getConstRule = (
  parser: SchemaParser,
  key: string,
  left: boolean,
  right: boolean,
): string => join(
  left ? getWhitespace(parser) : undefined,
  key,
  right ? getWhitespace(parser) : undefined,
);
