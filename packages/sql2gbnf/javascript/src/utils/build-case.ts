export const buildCase = (...strs: string[]): string => strs.reduce<string[]>((acc, str) => acc.concat([
  str.toLowerCase(),
  str.toUpperCase(),
]), []).map(str => JSON.stringify(str)).join(' | ');
