import {
  describe,
  expect,
  test,
} from 'vitest';
import {
  makeMockTextGenerationPipeline as _makeMockTextGenerationPipeline
} from "../../llms/js-llms/transformersjs/__mocks__/mock-text-generation-pipeline.js";

import GBNF from "gbnf";
import { GrammarParser } from "./grammar-parser.js";
import { BidirectionalMap } from "../bidirectional-map.js";

const STOP_TOKEN_ID = -999;
const STOP_TOKEN = '<|endoftext|>';

export const makeByteDecoder = (vocab: string[]) => vocab.reduce<Record<string, number>>((_acc, word) => [...word].reduce<Record<string, number>>((acc, char) => {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) {
    throw new Error(`Could not get code point for ${char}`);
  }
  return {
    ...acc,
    [char]: codePoint,
  };
}, _acc), {});

const buildOptsForWords = (words: string[]) => {
  const byte_decoder = makeByteDecoder(words);
  return {
    stopTokenId: STOP_TOKEN_ID,
    vocabSize: words.length,
    getToken: tokenId => words[tokenId],
    getDecodedByteForChar: (char) => byte_decoder[char],
  };
};

const getWordsOfIds = (arr: string[], ids: Set<number>) => {
  const tokenIds: string[] = [];
  for (const id of ids) {
    if (id === STOP_TOKEN_ID) {
      tokenIds.push(STOP_TOKEN);
    } else {
      tokenIds.push(arr[id]);
    }
  }
  return new Set(tokenIds);
};

describe('GrammarParser', () => {
  test('it instantiates', () => {
    new GrammarParser(buildOptsForWords([]));
  });

  describe('getTokensForParseState', () => {
    test.each([
      [
        `root ::= "foo" | "bar" | "baz"`,
        ['a', 'b', 'c', 'f', 'x', 'z',],
        ['f', 'b'],
      ],
      [
        `root ::= "foo" | "bar" | "baz"`,
        ['fo'],
        ['fo'],
      ],
      [
        `root ::= "foo" | "bar" | "baz"`,
        ['a', 'b', 'c', 'f', 'x', 'z', "fo", "ba"],
        ['f', 'b', 'fo', 'ba'],
      ],
      [
        `root ::= "foo" | "bar" | "baz"`,
        ['a', 'b', 'c', 'f', 'x', 'z', "fo", "ba", "foo", "bar", "baz", "fooo", "bazz", "barr"],
        ['f', 'b', 'fo', 'ba', 'foo', 'bar', 'baz'],
      ],
      [
        `root ::= "abcdefg"`,
        ['a', 'b', 'c', 'd', 'ab', 'bc', 'cd', 'abc', 'bcd', 'abcd', 'abcdef'],
        ['a', 'ab', 'abc', 'abcd', 'abcdef'],
      ],
      [
        `root ::= [abcde]`,
        ['a', 'b', 'c', 'd', 'ab', 'bc', 'cd', 'abc', 'bcd', 'abcd', 'abcdef'],
        ['a', 'b', 'c', 'd'],
      ],
      [
        `root ::= "- "`,
        [' ', '-', '- '],
        ['-', '- '],
      ],
      [
        `root ::= "- "`,
        [' ', '-', '- ', '-f'],
        ['-', '- '],
      ],
    ])('CHAR: %s, %s', (grammar, words, expected) => {
      const trie = new GrammarParser(buildOptsForWords(words))
      const parseState = GBNF(grammar);
      const tokens = trie.getTokens(parseState, Infinity);
      expect(getWordsOfIds(words, tokens)).toEqual(new Set(expected));
    });

    test.each([
      [
        `root ::= [a-f] "012"`,
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', '0', '1', '2', 'a0', 'b0', 'c0', 'a01', 'a12', 'a012'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'a0', 'b0', 'c0', 'a01', 'a012'],
      ],
      [
        `root ::= [a-fA-F] "012"`,
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', '0', '1', '2', 'a0', 'b0', 'c0', 'a01', 'a12', 'a012', 'A', 'B', 'C', 'C012'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'a0', 'b0', 'c0', 'a01', 'a012', 'A', 'B', 'C', 'C012'],
      ],
    ])('RANGE: %s, %s', (grammar, words, expected) => {
      const trie = new GrammarParser(buildOptsForWords(words))
      const parseState = GBNF(grammar);
      expect(getWordsOfIds(words, trie.getTokens(parseState, Infinity))).toEqual(new Set(expected));
    });

    test('END', () => {
      const words = ['foo'];
      const trie = new GrammarParser(buildOptsForWords(words))
      const parseState = GBNF(`root ::= "foo"`, 'foo');
      expect(getWordsOfIds(words, trie.getTokens(parseState, Infinity))).toEqual(new Set([STOP_TOKEN]));
    });

    describe('MODIFIERS', () => {
      test.each([
        [`root ::= [a-d]?`, ['a', 'b', 'c', 'd', STOP_TOKEN], ''],
        [`root ::= [a-d]?`, [STOP_TOKEN], 'a'],
        [`root ::= [a-d]+`, ['a', 'b', 'c', 'd'], ''],
        [`root ::= [a-d]+`, ['a', 'b', 'c', 'd', STOP_TOKEN], 'a'],
        [`root ::= [a-d]*`, ['a', 'b', 'c', 'd', STOP_TOKEN], ''],
        [`root ::= [a-d]*`, ['a', 'b', 'c', 'd', STOP_TOKEN], 'a'],
        [`root ::= [a-d]*`, ['a', 'b', 'c', 'd', STOP_TOKEN], 'abcd'],
      ])('%s, %s', (grammar, expected, initial) => {
        const words = ['a', 'b', 'c', 'd'];
        const trie = new GrammarParser(buildOptsForWords(words))
        const parseState = GBNF(grammar, initial);
        expect(getWordsOfIds(words, trie.getTokens(parseState, Infinity))).toEqual(new Set(expected));
      });

    });

    describe('CHAR_NOT', () => {
      test.each([
        [`root ::= [^a]`, ['b', 'c', 'd'], undefined],
        [`root ::= [^a]`, [STOP_TOKEN], 'b'],
        [`root ::= [^ab]`, ['c', 'd'], undefined],
        [`root ::= [^ab]`, [STOP_TOKEN], 'c'],
        [`root ::= [^abc]`, ['d'], undefined],
        [`root ::= [^a-c]`, ['d'], undefined],
        [`root ::= [^a]`, [STOP_TOKEN], 'b'],
        [`root ::= [^a] [^a]?`, [STOP_TOKEN, 'b', 'c', 'd'], 'b'],
        [`root ::= [^a-c] | [d-f]`, ['d'], undefined],
      ])('%s, %s', (grammar, expected, initial) => {
        const words = ['a', 'b', 'c', 'd'];
        const trie = new GrammarParser(buildOptsForWords(words))
        const parseState = GBNF(grammar, initial);
        expect(getWordsOfIds(words, trie.getTokens(parseState, Infinity))).toEqual(new Set(expected));
      });

      test('it throws if no valid tokens exist', () => {
        const grammar = `root ::= [^abcd]`;
        const words = ['a', 'b', 'c', 'd'];
        const trie = new GrammarParser(buildOptsForWords(words))
        const parseState = GBNF(grammar);
        expect(() => trie.getTokens(parseState, Infinity)).toThrow();
      });

    });

    test.each([
      [1, ['f', 'b']],
      [2, ['f', 'b', 'fo', 'ba']],
      [3, ['f', 'b', 'fo', 'ba', 'foo', 'bar']],
    ])('limits to a maximum depth of %i', (depth, expected) => {
      const words = ['f', 'fo', 'foo', 'b', 'ba', 'bar'];
      const grammar = `root ::= "foo" | "bar"`;
      const trie = new GrammarParser(buildOptsForWords(words))
      const parseState = GBNF(grammar);
      expect(getWordsOfIds(words, trie.getTokens(parseState, depth))).toEqual(new Set(expected));
    });

    describe('Real world examples', () => {
      test.each([
        [
          `root ::= item+\\n item ::= "- " [^\\r]+ "\\n" `,
          ['-', ' ', ' a', ' b', '\\r', '\\n', '\\x0b', '\\x0c', '\\x85', '\\u2028', '\\u2029', '\\n'],
          ['-'],
          '',
        ],
        [
          `root ::= item+\\n item ::= "- " [^\\r]+ "\\n" `,
          ['-', ' ', ' a', ' b', '\\r', '\\n', '\\x0b', '\\x0c', '\\x85', '\\u2028', '\\u2029', '- a\\n', '- b\\n', '\\n'],
          ['-', '- a\\n', '- b\\n'],
          '',
        ],
        [
          `root ::= item+\\n item ::= "- " [^\\r]+ "\\n" `,
          ['-', ' ', ' a', ' b', '\\r', '\\n', '\\x0b', '\\x0c', '\\x85', '\\u2028', '\\u2029', '- a\\n', '- b\\n', '\\n', '- a', '- b'],
          ['-', '- a\\n', '- b\\n', '- a', '- b'],
          '',
        ],
        [
          `root ::= item+\\n item ::= "- " [^\\r]+ "\\n" `,
          ['-', ' ', ' a', ' b', '\\r', '\\n', '\\x0b', '\\x0c', '\\x85', '\\u2028', '\\u2029', '- a\\n', '- b\\n', '\\n', '- a', '- b'],
          [' ', ' a', ' b'],
          '-',
        ],
      ])('%s, %s', (grammar, words, expected, initial) => {
        const trie = new GrammarParser(buildOptsForWords(words))
        const parseState = GBNF(grammar.split('\\n').join('\n'), initial);
        expect(getWordsOfIds(words, trie.getTokens(parseState, Infinity))).toEqual(new Set(expected));
      });

    });
  });
});
