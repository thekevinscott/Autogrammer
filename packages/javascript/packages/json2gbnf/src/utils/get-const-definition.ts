import { QUOTE_KEY, } from "../constants/grammar-keys.js";
import type { JSONSchemaObjectValueConst, } from "../types.js";

export const getConstDefinition = (value: JSONSchemaObjectValueConst) => ([
  QUOTE_KEY,
  `"${value.const}"`,
  QUOTE_KEY,
]);
