import { join, } from "gbnf/builder-v1";
import { rule, } from "./get-rule.js";

export const star = (...str: string[]) => `${rule(join(...str))}*`;
