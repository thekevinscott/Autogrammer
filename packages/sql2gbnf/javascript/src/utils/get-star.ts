import { join, } from "gbnf";
import { rule, } from "./get-rule.js";

export const star = (...str: string[]) => `${rule(join(...str))}*`;
