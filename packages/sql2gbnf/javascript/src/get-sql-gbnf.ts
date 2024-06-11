import {
  _,
  GBNFRule,
} from "gbnf/builder";
import {
  selectRuleWithUnion,
} from "./select/index.js";
import type {
  CaseKind,
  Database,
  WhitespaceKind,
} from "./types.js";
import {
  insertRule,
} from "./insert/index.js";
import {
  deleteRule,
} from "./delete/index.js";
import {
  nroptws,
} from "./constants.js";

export const getSQLGBNF = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  database?: Database,
  // schema?: string,
): GBNFRule => {
  const gbnf = _`
    ${_`
      ${selectRuleWithUnion}
      | ${insertRule} 
      | ${deleteRule}
    `.wrap()}
    ${_`
      ${nroptws} 
      ";"
    `.wrap('?')}
  `;
  return gbnf;
};
