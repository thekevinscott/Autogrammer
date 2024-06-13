import {
  $,
  _,
} from "gbnf/builder";
import {
  ws,
} from '../constants.js';
import {
  selectRule,
} from "./select-rule.js";

export const selectRuleWithUnion = _`
  ${selectRule}
  ${_`
    ${ws} 
    ${$`UNION`} 
    ${ws} 
    ${_`
      ${$`ALL`} 
      ${ws}
    `.wrap('?')} 
    ${selectRule}
  `.wrap('*')
  }
`;

