export const getID = (i: number) => (
  (i >= 26 ? getID(((i / 26) >> 0) - 1) : "") +
  "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0]
);

