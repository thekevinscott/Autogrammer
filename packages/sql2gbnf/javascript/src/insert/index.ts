import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import {
  select as getSelectRule,
} from '../select/index.js';

export const getInsertRule = ({
  number,
  stringWithQuotes,
  optionalRecommendedWhitespace: optRecWs,
  optionalNonRecommendedWhitespace: optNRecWs,
  mandatoryWhitespace,
  validFullName,
  boolean,
  equalOps,
  arithmeticOps,
  numericOps,
  positiveInteger,
}: {
  boolean: GBNFRule;
  number: GBNFRule,
  stringWithQuotes: GBNFRule;
  optionalRecommendedWhitespace: GBNFRule | undefined;
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  mandatoryWhitespace: GBNFRule | undefined;
  validFullName: GBNFRule;
  equalOps: GBNFRule;
  arithmeticOps: GBNFRule;
  numericOps: GBNFRule;
  positiveInteger: GBNFRule;
}
): GBNFRule => {
  const selectRule = getSelectRule({
    equalOps,
    arithmeticOps,
    numericOps,
    positiveInteger,
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

  const listOfStrings = (value: GBNFRule | string) => _` "(" ${optNRecWs} ${value} ${_` "," ${optRecWs} ${value} `.wrap('*')} ${optNRecWs} ")" `;
  return _`
    ${$`INSERT`}
    ${mandatoryWhitespace}
    ${$`INTO`}
    ${mandatoryWhitespace}
    ${validFullName}
    ${optRecWs}
    ${listOfStrings(validFullName)}
    ${optRecWs}
    ${$`VALUES`}
    ${optRecWs}
    ${listOfStrings(_`${stringWithQuotes} | ${number} | ${boolean} | ${$`NULL`} | ${selectRule} | "(" ${selectRule} ")"`.wrap())}
  `;
};
