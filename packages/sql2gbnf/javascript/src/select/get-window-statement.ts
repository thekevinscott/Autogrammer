import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";

export const getWindowStatement = ({
  colName,
  positiveInteger,
  optionalRecommendedWhitespace,
  optionalNonRecommendedWhitespace,
}: {
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  optionalRecommendedWhitespace: GBNFRule | undefined;
  colName: GBNFRule;
  positiveInteger: GBNFRule;
}): GBNFRule => _`
  ${_`
    ${_` ${$`RANK`} | ${$`DENSE_RANK`} | ${$`ROW_NUMBER`} `} 
    "()"
  `}
  | ${_`
    ${_` ${$`LEAD`} | ${$`LAG`} `}
    "("
      ${optionalNonRecommendedWhitespace}
      ${colName}
      ","
      ${optionalRecommendedWhitespace}
      ${positiveInteger}
      ${_`
        "," 
        ${optionalRecommendedWhitespace} 
        ${positiveInteger}
      `.wrap('?')}
      ${optionalNonRecommendedWhitespace}
    ")"
  `}
`;
