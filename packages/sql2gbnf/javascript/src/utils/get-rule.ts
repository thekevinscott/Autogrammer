import { join, } from "gbnf/builder";

export const rule = (...rule: string[]) => `(${join(...rule)})`;
