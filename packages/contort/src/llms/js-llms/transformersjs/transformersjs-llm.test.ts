import {
  describe,
  test,
  expect,
  afterEach,
} from 'vitest';
import * as _GrammarParser from './grammar-parser/index.js';

import { TransformersJSLLM } from './transformersjs-llm.js';

import { makeMockTextGenerationPipeline } from './__mocks__/mock-text-generation-pipeline.js';
import { vi } from 'vitest';

vi.mock("./grammar-parser/index.js", async () => {
  const actual = await vi.importActual("./grammar-parser/index.js") as typeof _GrammarParser;
  class MockGrammarParser {

  }
  return {
    ...actual,
    default: MockGrammarParser,
  };
});

describe('TransformersJSLLM', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('it initializes', () => {
    const mockPipeline = makeMockTextGenerationPipeline();
    const llm = new TransformersJSLLM(mockPipeline);
    expect(llm.pipeline).toBe(mockPipeline);
  });
  // max_new_tokens: n,
});
