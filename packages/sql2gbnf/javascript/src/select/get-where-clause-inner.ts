import {
  GBNFRule,
  _,
  $,
} from "gbnf/builder-v2";

export const getWhereClauseInner = ({
  validFullName,
  equalOps,
  optRecWS,
  optNonRecWS,
  positiveInteger,
  stringWithQuotes,
  numericOps,
  number,
  ws,
}: {
  validFullName: GBNFRule;
  equalOps: GBNFRule;
  optRecWS: GBNFRule | undefined;
  optNonRecWS: GBNFRule | undefined;
  positiveInteger: GBNFRule;
  stringWithQuotes: GBNFRule;
  numericOps: GBNFRule;
  number: GBNFRule;
  ws: GBNFRule | undefined;
}) => {
  const dateDef = _` "'" [0-9] [0-9] [0-9] [0-9] "-" [0-9] [0-9] "-" [0-9] [0-9] "'" `;
  return _`
  ${validFullName}
  ${_`
    ${_`
      ${optRecWS} 
      ${equalOps}
      ${optRecWS}
      ${_`
        ${validFullName}
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
