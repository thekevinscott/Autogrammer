import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import {
  getSelectRuleWithUnion as getSelectRule,
} from '../select/index.js';
import {
  stringWithQuotes,
  number,
  boolean,
  tableName,
  columnName,
  validAlias,
} from "../constants.js";

export const getInsertRule = ({
  optionalRecommendedWhitespace: optRecWs,
  optionalNonRecommendedWhitespace: optNRecWs,
  mandatoryWhitespace,
}: {
  optionalRecommendedWhitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  mandatoryWhitespace: GBNFRule | undefined;
}
): GBNFRule => {
  const selectRule = getSelectRule({
    optionalRecommendedWhitespace: optRecWs,
    optionalNonRecommendedWhitespace: optNRecWs,
    mandatoryWhitespace,
    withUnion: false,
    singleColumn: true,
  });

  const listOfStrings = (value: GBNFRule | string) => _` 
    "(" 
      ${optNRecWs} 
      ${value} 
      ${_`
        "," 
        ${optRecWs} 
        ${value}
      `.wrap('*')} 
      ${optNRecWs} 
    ")" 
  `;
  return _`
    ${$`INSERT`}
    ${mandatoryWhitespace}
    ${$`INTO`}
    ${mandatoryWhitespace}
    ${tableName}
    ${_`${mandatoryWhitespace} ${validAlias}`.wrap("?")}
    ${optRecWs}
    ${listOfStrings(columnName)}
    ${optRecWs}
    ${$`VALUES`}
    ${optRecWs}
    ${listOfStrings(_`
      ${stringWithQuotes} 
      | ${number} 
      | ${boolean} 
      | ${$`NULL`} 
      | ${selectRule} 
      | "(" 
          ${optNRecWs} 
          ${selectRule} 
          ${optNRecWs} 
        ")"
    `.wrap())}
  `;
};
