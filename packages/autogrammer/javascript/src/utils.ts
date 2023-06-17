import { isSupportedSyntax, } from "./type-guards.js";

export const buildPrompt = (prompt: string, language?: unknown) => {
  if (typeof language === 'string' && isSupportedSyntax(language)) {
    return [
      `You are a very helpful codebot. Do your best to answer the user's query using only the language "${language}".`,
      '',
      prompt.trim(),
    ].join('\n');
  }
  return [
    `You are a very helpful codebot. Do your best to answer the user's query using the provided grammar.`,
    '',
    prompt.trim(),
  ].join('\n');
};
