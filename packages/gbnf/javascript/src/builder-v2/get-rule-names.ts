import {
  joinWith,
} from "../builder-v1/index.js";
import {
  GBNFRule,
} from "./gbnf-rule.js";
import {
  GrammarBuilder,
} from "./grammar-builder.js";
import {
  _,
} from './template-tags.js';
import {
  CaseKind,
  Value,
} from "./types.js";

export type RuleNames = (string | RuleNames)[];

export const getRuleNames = (
  values: Value[],
  parser: GrammarBuilder,
  caseKind: CaseKind,
  separator?: string,
): string[] => values.reduce<string[]>((
  acc,
  value,
) => {
  if (Array.isArray(value)) {
    const ruleNames = getRuleNames(value, parser, caseKind, separator);
    const rule = _`${joinWith(separator ? separator : ' ', ...ruleNames)}`;
    return acc.concat(rule.addToParser(parser, caseKind, true));
  }
  if (value instanceof GBNFRule) {
    return acc.concat(value.addToParser(parser, caseKind, true));
  }
  if (value !== undefined) {
    return acc.concat(value);
  }
  return acc;
}, []);

