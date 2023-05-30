import { join, } from "gbnf/builder-v1";

export const rule = (...rule: string[]) => `(${join(...rule)})`;
