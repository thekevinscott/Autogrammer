import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import {
  positiveInteger,
  columnName,
} from '../constants.js';

export const getWindowStatement = ({
  optionalRecommendedWhitespace,
  optionalNonRecommendedWhitespace,
}: {
  optionalNonRecommendedWhitespace: GBNFRule | undefined;
  optionalRecommendedWhitespace: GBNFRule | undefined;
}): GBNFRule => _`
  ${_`
    ${_` ${$`RANK`} | ${$`DENSE_RANK`} | ${$`ROW_NUMBER`} `} 
    "()"
  `}
  | ${_`
    ${_` ${$`LEAD`} | ${$`LAG`} `}
    "("
      ${optionalNonRecommendedWhitespace}
      ${columnName}
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
