import { Grammar, } from "../../types.js";
import { ParseState, } from "gbnf";
import GBNF from "gbnf";
import { GrammarParserNode, } from "./grammar-parser-node.js";
import { BidirectionalMap, } from "../bidirectional-map.js";
import type {
  GetToken,
} from "./types.js";

export type GetNextTokenIds = () => Set<number>;
export type AddToken = (token: string) => void;

const DEFAULT_MAXIMUM_DEPTH = 6;

export class GrammarParser {
  #parseState: ParseState;
  #root: GrammarParserNode;
  #vocab = new BidirectionalMap<number, string>();
  constructor({
    vocabSize,
    stopTokenId,
    getToken,
  }: {
    vocabSize: number,
    stopTokenId: number,
    getToken: GetToken;
  }) {
    this.#root = new GrammarParserNode(stopTokenId);
    for (let tokenId = 0; tokenId < vocabSize; tokenId++) {
      const token = getToken(tokenId);
      this.#vocab.set(tokenId, token);
      this.#root.add(tokenId, token);
    }
  }

  getTokens = (state: ParseState, maximumDepth: number) => {
    const tokenIds = this.#root.getTokens(state, { maximumDepth, });
    if (tokenIds.size === 0) {
      throw new Error('Grammar is incorrect; no rule was found.');
    }
    return tokenIds;
  };

  get parseState() {
    if (!this.#parseState) {
      throw new Error('GrammarParser not initialized');
    }
    return this.#parseState;
  }
  set parseState(parseState: ParseState) { this.#parseState = parseState; }

  initialize = (grammar: Grammar) => this.parseState = GBNF(grammar);
  addToken: AddToken = (token) => this.parseState = this.parseState.add(token);
  getNextTokenIds: GetNextTokenIds = (maximumDepth: number = DEFAULT_MAXIMUM_DEPTH) => this.getTokens(this.parseState, maximumDepth);
}
