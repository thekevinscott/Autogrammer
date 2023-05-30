import { joinPipe, } from "gbnf/builder-v1";
import { rule, } from "./get-rule.js";

export const any = (...arr: string[]): string => rule(joinPipe(...arr));
