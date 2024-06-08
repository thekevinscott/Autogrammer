import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder";
import { getSelectRule, } from "./get-select-rule.js";

export const getSelectRuleWithUnion = ({
  optionalRecommendedWhitespace: optRecWS,
  optionalNonRecommendedWhitespace: optNonRecWS,
  mandatoryWhitespace: ws,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  singleColumn = false,
}: {
  optionalRecommendedWhitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  mandatoryWhitespace: GBNFRule;
  singleColumn?: boolean;
}
): GBNFRule => {
  const selectRule = getSelectRule({
    optRecWS,
    optNonRecWS,
    ws,
    singleColumn,
  });
  return _`
      ${selectRule}
      ${_`
        ${ws} 
        ${$`UNION`} 
        ${ws} 
        ${_`
          ${$`ALL`} 
          ${ws}
        `.wrap('?')} 
        ${selectRule}
      `.wrap('*')
    }
    `;
};

