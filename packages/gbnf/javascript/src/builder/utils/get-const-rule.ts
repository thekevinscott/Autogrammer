import { GrammarBuilder, } from "../Grammar-Builder.js";
import { getWhitespace, } from "./get-whitespace.js";
import { join, } from "./join.js";

export const getConstRule = (
  grammarBuilder: GrammarBuilder,
  key: string,
  left: boolean,
  right: boolean,
): string => join(
  left ? getWhitespace(grammarBuilder) : undefined,
  key,
  right ? getWhitespace(grammarBuilder) : undefined,
);
