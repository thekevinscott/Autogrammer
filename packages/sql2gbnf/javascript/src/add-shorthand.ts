import {
  GrammarBuilder,
  GBNFRule,
  CaseKind,
} from "gbnf/builder-v2";
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const addShorthand = (rule: GBNFRule, parser: GrammarBuilder, caseKind: CaseKind = 'any') => rule.addToParser(parser, caseKind, true);
