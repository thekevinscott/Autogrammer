import type {
  LogitProcessor,
  Tokenizer,
} from "./types";
import { maskLogits, } from "../../../utils/mask-logits";
import { GrammarParser, } from "../../../utils/grammar-parser";
export class GrammarLogitsProcessor implements LogitProcessor {
  private tokenSequence: Array<number> = [];
  private generatedSequence: string = '';
  parser: GrammarParser;
  #tokenizer: Tokenizer;
  prompt: string;
  lastLen: number = 0;

  constructor(
    prompt: string,
    parser: GrammarParser,
    public maximumDepth?: number
  ) {
    this.parser = parser;
    this.lastLen = prompt.length;
    this.prompt = prompt;
  }

  set tokenizer(tokenizer: Tokenizer) {
    this.#tokenizer = tokenizer;
  };
  get tokenizer() {
    return this.#tokenizer;
  };

  getAllowedTokenIds(decoded: string): Set<number> {
    if (this.lastLen < decoded.length + this.prompt.length) {
      const token = decoded.slice(this.lastLen - this.prompt.length);
      this.parser.addToken(token);
      this.lastLen += token.length;
    }
    return this.parser.getNextTokenIds(this.maximumDepth);
  }

  processLogits(logits: Float32Array): Float32Array {
    const allowedTokenIds = this.getAllowedTokenIds(this.generatedSequence);
    return maskLogits(logits, allowedTokenIds);
  }

  processSampledToken(chosenToken: number): void {
    if (!this.tokenizer) {
      throw new Error('Tokenizer was never initialized');
    }
    // this is called _after_ we have chosen our next token.
    this.tokenSequence.push(chosenToken);
    this.generatedSequence = this.tokenizer.decode(new Int32Array(this.tokenSequence));
  }

  resetState(): void {
    this.tokenSequence = [];
    this.generatedSequence = '';
  }
}
