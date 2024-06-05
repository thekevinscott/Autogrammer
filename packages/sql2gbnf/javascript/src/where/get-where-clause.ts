import {
  GBNFRule,
  _,
  $,
} from 'gbnf/builder-v2';
export const getWhereClause = ({
  whereClauseInner,
  ws,
}: {
  ws: GBNFRule;
  whereClauseInner: GBNFRule;
}): GBNFRule => _`
  ${ws}
  ${$`WHERE`}
  ${ws}
  ${_`
    ${$`NOT`}
    ${ws}
  `.wrap('?')}
  ${whereClauseInner}
  ${_`
    ${_` ${ws} ${$`AND`} ${ws} ${whereClauseInner} `}
    | ${_` ${ws} ${$`OR`} ${ws} ${whereClauseInner} `}
  `.wrap('*')}
`;
