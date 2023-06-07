import { getID, } from "gbnf/builder-v1";
import {
  GBNFRule,
  GrammarBuilder,
} from "gbnf/builder-v2";

export const addShorthand = (rule: GBNFRule, parser: GrammarBuilder, symbolName?: string,): string => {
  if (symbolName === undefined) {
    symbolName = getID(Math.round(Math.random() * 10000000));
  }
  rule.key(symbolName).addToParser(parser as unknown as GrammarBuilder, 'any', true);
  return symbolName;
};
