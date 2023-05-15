import { join, } from "gbnf";

export const rule = (...rule: string[]) => `(${join(...rule)})`;
