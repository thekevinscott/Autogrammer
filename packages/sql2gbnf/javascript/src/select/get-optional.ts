import { join, } from "gbnf";
import { rule, } from "./get-rule.js";

export const opt = (...str: string[]) => `${rule(join(...str))}?`;
