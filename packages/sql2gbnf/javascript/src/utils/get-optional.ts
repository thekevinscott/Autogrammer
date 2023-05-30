import { join, } from "gbnf/builder-v1";
import { rule, } from "./get-rule.js";

export const opt = (...str: string[]) => `${rule(join(...str))}?`;
