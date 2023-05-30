import {
  WHITESPACE_KEY as WS,
} from "gbnf/builder-v1";
import {
  type GrammarBuilder,
} from "gbnf/builder-v2";
import { WhitespaceKind, } from "../types.js";
import {
  OPTIONAL_NON_RECOMMENDED_WHITESPACE,
  OPTIONAL_RECOMMENDED_WHITESPACE,
  WHITESPACE,
} from "../gbnf-keys.js";

const isWhitespaceKind = (whitespace: WhitespaceKind): whitespace is WhitespaceKind => ['default', 'succinct', 'verbose',].includes(whitespace);

const getGetWhitespaceDef = (whitespace: WhitespaceKind) => (mandatory: boolean, recommended = true) => {
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
        return `(${WS})+`;
      }
      return `(${WS})*`;
    },
    default: () => {
      if (mandatory) {
        return `(${WS}) `;
      }
      if (recommended) {
        return WS;
      }
      return undefined;
    },
  }[whitespace]();
};

export const getWhitespaceDefs = (
  parser: GrammarBuilder,
  whitespaceKind: WhitespaceKind
) => {
  const getWhitespaceDef = getGetWhitespaceDef(whitespaceKind);
  const mandatoryWhitespaceDef = getWhitespaceDef(true);
  const optionalRecommendedWhitespaceDef = getWhitespaceDef(false, true);
  const optionalNonRecommendedWhitespaceDef = getWhitespaceDef(false, false);
  // console.log('defs for', whitespaceKind, { optionalNonRecommendedWhitespaceDef, optionalRecommendedWhitespaceDef, whitespaceDef: mandatoryWhitespaceDef, });
  const optionalRecommendedWhitespace = optionalRecommendedWhitespaceDef === undefined ? '' : parser.addRule(optionalRecommendedWhitespaceDef, OPTIONAL_RECOMMENDED_WHITESPACE);
  const optionalNonRecommendedWhitespace = optionalNonRecommendedWhitespaceDef === undefined ? '' : parser.addRule(optionalNonRecommendedWhitespaceDef + ' ', OPTIONAL_NON_RECOMMENDED_WHITESPACE);
  const whitespace = mandatoryWhitespaceDef === undefined ? '' : parser.addRule(mandatoryWhitespaceDef, WHITESPACE);
  // console.log({ optionalNonRecommendedWhitespace, optionalRecommendedWhitespace, whitespace, });
  return {
    optionalNonRecommendedWhitespace,
    optionalRecommendedWhitespace,
    whitespace,
  };
};
