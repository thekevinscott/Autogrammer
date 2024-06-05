import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import {
  positiveInteger,
} from '../constants.js';

export const getLimitClause = ({
  ws,
  optRecWS,
}: {
  ws: GBNFRule;
  optRecWS: GBNFRule | undefined;
}): GBNFRule => _`
  ${ws} 
  ${$`LIMIT`}
  ${_`
    ${optRecWS} 
    ${positiveInteger} 
    ","
  `.wrap('?')}
  ${optRecWS}
  ${positiveInteger}
  ${_`
    ${ws}
    ${$`OFFSET`}
    ${ws}
    ${positiveInteger}
  `.wrap('?')}
`;
