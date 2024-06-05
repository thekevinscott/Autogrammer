import {
  GBNFRule,
  _,
  $,
} from "gbnf/builder-v2";
import {
  columnName,
  positiveInteger,
  stringWithQuotes,
  numericOps,
  number,
  getEqualOps,
  dateDef,
} from "../constants.js";

export const getWhereClauseInner = ({
  optRecWS,
  optNonRecWS,
  ws,
}: {
  optRecWS: GBNFRule | undefined;
  optNonRecWS: GBNFRule | undefined;
  ws: GBNFRule;
}) => {
  const equalOps = getEqualOps(ws);
  return _`
  ${columnName}
  ${_`
    ${_`
      ${optRecWS} 
      ${equalOps}
      ${optRecWS}
      ${_`
        ${columnName}
        | ${positiveInteger}
        | ${stringWithQuotes}
      `}
    `}
    | ${_`
      ${optRecWS} 
      ${numericOps}
      ${optRecWS}
      ${_` ${number} | ${dateDef} `}
    `}
    | ${_`
      ${optRecWS} 
      ${$`LIKE`}
      ${optRecWS}
      ${stringWithQuotes}
    `}
    | ${_`
      ${optRecWS} 
      ${$`BETWEEN`}
      ${ws}
      ${_`
        ${_` ${number} ${ws} ${$`AND`} ${ws} ${number} `}
        | ${_` ${stringWithQuotes} ${ws} ${$`AND`} ${ws} ${stringWithQuotes} `}
      `}
    `}
    |
    ${_`
      ${ws} 
      ${$`IN`}
      ${ws}
      "("
        ${optRecWS}
        ${stringWithQuotes}
        ${_`
          ","
          ${optRecWS}
          ${stringWithQuotes}
        `.wrap('*')}
        ${optNonRecWS}
      ")"
    `}
  `}
  `;
};
