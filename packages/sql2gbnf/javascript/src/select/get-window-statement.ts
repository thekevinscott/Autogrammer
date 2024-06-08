import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder";
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
}): GBNFRule => {
  const rankRule = _`
      ${_`${[$`RANK`, $`DENSE_RANK`, $`ROW_NUMBER`,]}`.separate(' | ')}
      "()"
    `;

  const leadLagRule = _`
      ${_`${[$`LEAD`, $`LAG`,]}`.separate(' | ')}
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
    `;

  return _` ${[rankRule, leadLagRule,]} `.separate(' | ');
};
