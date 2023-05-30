import { WHITESPACE_KEY, } from "../constants/grammar-keys.js";
import { joinWith, } from "./join.js";

export const getConstKey = (key: string, left: boolean, right: boolean): string => joinWith(
  '',
  left ? WHITESPACE_KEY : undefined,
  key,
  right ? WHITESPACE_KEY : undefined,
);
