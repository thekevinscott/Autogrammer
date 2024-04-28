// import './antlr';
import Coder from '../../../autogrammer/src/index.js';

const coder = new Coder({
  model: 'Xenova/gpt2',
  // model: 'Xenova/phi-1_5_dev',
  // parser: 'antlr4',
  parser: 'lark',
});

coder.synthesize('Write me a JSON array with the first three letters of the alphabet contained: ', { maxTokens: 3 });
