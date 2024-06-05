import {
  _,
  GBNFRule,
} from "gbnf/builder-v2";
import {
  getSelectRuleWithUnion,
} from "./select/index.js";
import type {
  CaseKind,
  Database,
  WhitespaceKind,
} from "./types.js";
import {
  getInsertRule,
} from "./insert/index.js";
import {
  getDeleteRule,
} from "./delete/index.js";
import {
  getWhitespaceDefs,
} from "./utils/get-whitespace-def.js";

export const getGBNF = (
  opts: {
    whitespace: WhitespaceKind;
    case: CaseKind,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  database?: Database,
  // schema?: string,
): GBNFRule => {
  const {
    optRecWS,
    optNonRecWS,
    ws,
  } = getWhitespaceDefs(opts.whitespace);

  const selectRule = getSelectRuleWithUnion({
    optionalRecommendedWhitespace: optRecWS,
    optionalNonRecommendedWhitespace: optNonRecWS,
    mandatoryWhitespace: ws,
  });

  const insertRule = getInsertRule({
    optionalRecommendedWhitespace: optRecWS,
    optionalNonRecommendedWhitespace: optNonRecWS,
    mandatoryWhitespace: ws,
  });

  const deleteRule = getDeleteRule({
    optionalRecommendedWhitespace: optRecWS,
    optionalNonRecommendedWhitespace: optNonRecWS,
    mandatoryWhitespace: ws,
  });

  const gbnf = _`
    ${_`
      ${selectRule}
      | ${insertRule} 
      | ${deleteRule}
    `.wrap()}
    ${_`
      ${optNonRecWS} 
      ";"
    `.wrap('?')}
  `;
  return gbnf;
};
