import { QUOTE_KEY, } from "../constants/grammar-keys.js";
import {
  AddRule,
  join,
} from "gbnf/builder";
import {
  JSONSchemaObjectValueEnum,
} from "../types.js";

export const parseEnum = (
  schema: JSONSchemaObjectValueEnum,
  addRule: AddRule,
) => addRule(schema.enum.map(value => join(QUOTE_KEY, `"${value}"`, QUOTE_KEY)).join(' | '));
