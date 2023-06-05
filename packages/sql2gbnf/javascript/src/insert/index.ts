import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import {
  select as getSelectRule,
} from '../select/index.js';

export const insert = ({
  number,
  stringWithQuotes,
  optionalRecommendedWhitespace: optRecWs,
  optionalNonRecommendedWhitespace: optNRecWs,
  mandatoryWhitespace,
  validFullName,
  boolean,
}: {
  boolean: GBNFRule;
  number: GBNFRule,
  stringWithQuotes: GBNFRule;
  optionalRecommendedWhitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  mandatoryWhitespace: GBNFRule | undefined;
  validFullName: GBNFRule;
}
): GBNFRule => {
  const selectRule = getSelectRule({
    boolean,
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace: optRecWs,
    optionalNonRecommendedWhitespace: optNRecWs,
    mandatoryWhitespace,
    number,
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
    ${$`INSERT INTO`}
    ${mandatoryWhitespace}
    ${validFullName}
    ${optRecWs}
    ${listOfStrings(validFullName)}
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
