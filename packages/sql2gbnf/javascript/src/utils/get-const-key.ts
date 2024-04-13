import { joinWith, } from "./join.js";

export const getConstKey = (key: string, left: boolean, right: boolean): string => joinWith(
  '',
  left ? 'ws' : undefined,
  key,
  right ? 'ws' : undefined,
);

