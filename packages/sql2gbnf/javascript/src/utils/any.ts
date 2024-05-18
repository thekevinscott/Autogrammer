import { joinPipe, } from "gbnf";
import { rule, } from "../select/get-rule.js";

export const any = (...arr: string[]): string => rule(joinPipe(...arr));
