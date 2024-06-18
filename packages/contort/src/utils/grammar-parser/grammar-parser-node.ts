import {
  type ParseState,
  RuleType,
} from "gbnf";

import { iterateOverNumericValue, } from "./iterate-over-numeric-value.js";
// import { GetDecodedByteForChar, } from "./types.js";
export const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

export class GrammarParserNode {
  #nodes = new Map<number, GrammarParserNode>();
  #childTokenIds = new Set<number>();
  #terminalTokenId: number[] = [];
  char?: string;

  stopTokenId: number;
  constructor(stopTokenId: number, char?: string) {
    this.stopTokenId = stopTokenId;
    this.char = char;
  }

  get = (input: number | string): GrammarParserNode | undefined => {
    if (typeof input === 'string') {
      return this.#nodes.get(input.codePointAt(0));
    }
    return this.#nodes.get(input);
  };

  *getNot(excluded: Set<number>): IterableIterator<GrammarParserNode> {
    for (const [key, value,] of this.#nodes) {
      if (!excluded.has(key)) {
        yield value;
      }
    }
  }

  get size() { return this.#nodes.size; }

  add = (
    tokenId: number,
    token: string,
    // getDecodedByteForChar: GetDecodedByteForChar,
    pos = 0,
  ) => {
    const decodedCodePoints = [...token,].map(char => {
      return char.codePointAt(0);
      // try {
      //   return getDecodedByteForChar(char);
      // } catch (err) {
      //   console.error(tokenId, token);
      //   // throw err;
      //   // return;
      // }
    });

    const char = token[pos];
    const decodedCodePoint = decodedCodePoints[pos];
    let node = this.#nodes.get(decodedCodePoint);
    if (!node) {
      node = new GrammarParserNode(this.stopTokenId, char);
      this.#nodes.set(decodedCodePoint, node);
    }

    if (pos === token.length - 1) {
      node.#terminalTokenId.push(tokenId);
    } else {
      node.#childTokenIds.add(tokenId);
      // node.add(tokenId, token, getDecodedByteForChar, pos + 1);
      node.add(tokenId, token, pos + 1);
    }
  };

  [customInspectSymbol]() {
    const name = this.char === undefined ? 'root' : `"${this.char}"`;
    return JSON.stringify({
      name,
      terminal: this.#terminalTokenId,
      numberOfNodes: this.#nodes.size,
      numberOfTokenIds: this.#childTokenIds.size,
    }, null, 2);
  }

  getTokens = (state: ParseState, {
    tokenIds = new Set(),
    currentDepth = 0,
    maximumDepth,
  }: {
    tokenIds?: Set<number>;
    currentDepth?: number;
    maximumDepth?: number;
  } = {}): Set<number> => {
    if (maximumDepth !== undefined && currentDepth > maximumDepth) {
      return tokenIds;
    }
    for (const rule of state) {
      if (rule.type === RuleType.CHAR) {
        if (this.#terminalTokenId !== undefined) {
          for (const tokenId of this.#terminalTokenId) {
            tokenIds.add(tokenId);
          }
        }
        for (const value of rule.value) {
          for (const codePoint of iterateOverNumericValue(value)) {
            const char = String.fromCodePoint(codePoint);
            const node = this.get(codePoint);
            if (node) {
              node.getTokens(state.add(char), { maximumDepth, tokenIds, currentDepth: currentDepth + 1, });
              if (node.#terminalTokenId !== undefined && (maximumDepth === undefined || currentDepth < maximumDepth)) {
                for (const tokenId of node.#terminalTokenId) {
                  tokenIds.add(tokenId);
                }
              }
            }
          }
        }
      } else if (rule.type === RuleType.CHAR_EXCLUDE) {
        const excluded = new Set<number>();
        for (const value of rule.value) {
          for (const codePoint of iterateOverNumericValue(value)) {
            excluded.add(codePoint);
          }
        }

        for (const node of this.getNot(excluded)) {
          for (const tokenId of node.#childTokenIds) {
            tokenIds.add(tokenId);
          }
          if (node.#terminalTokenId !== undefined) {
            for (const tokenId of node.#terminalTokenId) {
              tokenIds.add(tokenId);
            }
          }
        }
      } else if (rule.type === RuleType.END) {
        if (currentDepth === 0) {
          tokenIds.add(this.stopTokenId);
        }
      }
    }
    return tokenIds;
  };
}
