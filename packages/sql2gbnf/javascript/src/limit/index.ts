import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder";
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
