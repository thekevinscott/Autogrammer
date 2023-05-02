import Contortionist from '../../../dist/index.js';
import chess from '../grammars/chess.gbnf?raw';

import {
  Engine,
  CreateEngine,
} from "@mlc-ai/web-llm";

const selectedModel = "Llama-3-8B-Instruct-q4f32_1";
// const selectedModel = "Phi1.5-q4f32_1-1k";

const engine: Engine = await CreateEngine(selectedModel, {
  initProgressCallback: console.log,
});

const contort = new Contortionist({
  model: engine,
  // grammar: `root ::= "foo" | "bar"`,
  grammar: chess,
  // grammar: `root ::= "1. "`,
  // grammar: `root ::= " ."`,
});

console.log(await contort.execute('Output an ELO 1200 game of chess in PGN format:\n', {
  callback: ({ partial, }) => console.log(partial),
  max_gen_len: 100,
}));
