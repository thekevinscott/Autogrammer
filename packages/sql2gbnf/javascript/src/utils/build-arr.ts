import { join, } from "./join.js";

export const buildArr = (n: number, content: string): string => {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('n must be a non-negative integer');
  }
  const arr: string[] = [];
  for (let i = 0; i < n; i++) {
    arr.push(content);
  }
  return join(...arr);
};

