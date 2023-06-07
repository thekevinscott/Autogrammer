import {
  _,
  GBNFRule,
} from "gbnf/builder-v2";
import type {
  JSONSchemaObjectValueConst,
} from "../types.js";
import {
  quote,
} from '../constants.js';

export const getConstDefinition = (value: JSONSchemaObjectValueConst): GBNFRule => _`
  ${quote} 
  "${value.const}"
  ${quote}
`;
