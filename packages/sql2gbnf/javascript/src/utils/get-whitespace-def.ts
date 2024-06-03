import { WhitespaceKind, } from "../types.js";
import {
  GBNFRule,
  _,
} from "gbnf/builder-v2";

const isWhitespaceKind = (whitespace: WhitespaceKind): whitespace is WhitespaceKind => ['default', 'succinct', 'verbose',].includes(whitespace);

const WS = _`[ \\t\\n\\r]`;

const getGetWhitespaceDef = (whitespace: WhitespaceKind) => (mandatory: boolean, recommended = true): GBNFRule | undefined => {
  if (!isWhitespaceKind(whitespace)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported whitespace type: ${whitespace}`);
  }
  return {
    succinct: () => {
      if (mandatory) {
        return WS;
      }
      return undefined;
    },
    verbose: () => {
      if (mandatory) {
        return WS.wrap('+');
      }
      return WS.wrap('*');
    },
    default: () => {
      if (mandatory) {
        return WS;
      }
      if (recommended) {
        return WS;
      }
      return undefined;
    },
  }[whitespace]();
};

export const getWhitespaceDefs = (
  whitespaceKind: WhitespaceKind
) => {
  const getWhitespaceDef = getGetWhitespaceDef(whitespaceKind);
  return {
    whitespace: getWhitespaceDef(true),
    optionalRecommendedWhitespace: getWhitespaceDef(false, true),
    optionalNonRecommendedWhitespace: getWhitespaceDef(false, false),
  };
};
