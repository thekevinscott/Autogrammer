import { join, } from "gbnf/builder";
import { rule, } from "./get-rule.js";

export const star = (...str: string[]) => `${rule(join(...str))}*`;
