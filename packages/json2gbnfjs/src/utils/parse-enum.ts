import { QUOTE_KEY, } from "../constants/grammar-keys.js";
import { join, } from "./join.js";
import {
  AddRule,
  JSONSchemaObjectValueEnum,
} from "../types.js";

export const parseEnum = (
  schema: JSONSchemaObjectValueEnum,
  addRule: AddRule,
) => addRule(schema.enum.map(value => join(QUOTE_KEY, `"${value}"`, QUOTE_KEY)).join(' | '));
