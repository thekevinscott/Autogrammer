import { join, } from "gbnf/builder";
import { rule, } from "./get-rule.js";

export const opt = (...str: string[]) => `${rule(join(...str))}?`;
