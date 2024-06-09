import { Autogrammer, } from "./autogrammer.js";

type GenerativeArgs = Parameters<typeof Autogrammer.prototype.generate>[1];
export const autogram = (prompt: string, args: GenerativeArgs) => {
  const grammer = new Autogrammer({
    language: 'json',
  });

  return grammer.generate(prompt, args);
};
