import {
  frontmatterKeys,
} from "./constants.js";

export const getFrontmatter = (frontmatter: string) => frontmatter.trim().split('\n').map(l => l.trim().split(':')).reduce((acc, [key, val,]) => {
  if (!frontmatterKeys.includes(key.trim())) {
    throw new Error(`Invalid frontmatter key: ${key}`);
  }
  return {
    ...acc,
    [key.trim()]: val.trim(),
  };
}, {});
