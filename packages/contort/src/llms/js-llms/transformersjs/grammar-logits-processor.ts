import { Tensor, } from "./types.js";
import { maskLogits, } from "../../../utils/mask-logits.js";
import { GrammarParser, } from "../../../utils/grammar-parser/grammar-parser.js";
import type {
  PreTrainedTokenizer,
} from "@xenova/transformers";

export type ParseInputTokens = (input_tokens: number[]) => BigInt64Array;
export class GrammarLogitsProcessor {
  tokenizer: PreTrainedTokenizer;
  parser: GrammarParser;
  lastLen: number = 0;

  constructor(prompt: string, parser: GrammarParser, tokenizer: PreTrainedTokenizer, public maximumDepth?: number) {
    this.parser = parser;
    this.tokenizer = tokenizer;
    this.lastLen = prompt.length;
  }

  getAllowedTokenIds(decoded: string): Set<number> {
    const token = decoded.slice(this.lastLen);
    this.parser.addToken(token);
    this.lastLen += token.length;
    return this.parser.getNextTokenIds(this.maximumDepth);
  }

  processors = [async (inputTokens: number[], logits: Tensor<Float32Array>) => {
    if (!inputTokens) {
      throw new Error('No input tokens provided');
    }
    const decoded = this.tokenizer.decode(inputTokens);
    const allowedTokenIds = this.getAllowedTokenIds(decoded);
    // console.log('allowedTokenIds', allowedTokenIds, [...allowedTokenIds,].map(tokenId => this.tokenizer.decode([tokenId,])));
    logits.data = maskLogits(logits.data, allowedTokenIds);
    await requestAnimationFrame();
    return logits;
  },];

  [Symbol.iterator]() {
    return this.processors.values();
  }
}

const requestAnimationFrame = () => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
