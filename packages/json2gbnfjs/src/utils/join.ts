type Value = unknown;
export const join = (...arr: Value[]): string => joinWith(' ', ...arr);
export const joinWith = (joiner: string, ...arr: Value[]): string => arr.filter(Boolean).join(joiner);
