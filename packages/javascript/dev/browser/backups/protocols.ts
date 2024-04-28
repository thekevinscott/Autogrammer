// import { TextGenerationPipeline } from '@xenova/transformers';
// // import './antlr';
// import Coder from '../../../packages/coder/src/index.js';

// const coder = new Coder({
//   model: 'Xenova/gpt2',
//   // model: 'Xenova/phi-1_5_dev',
//   // parser: 'antlr4',
//   parser: 'lark',
// });

// coder.execute('Write me a JSON array with the first three letters of the alphabet contained: ', { maxTokens: 3 });

type LLMProtocol = 'openai';

const ARITHMETIC_GRAMMAR = `
root  ::= (expr "=" ws term "\n")+
expr  ::= term ([-+*/] term)*
term  ::= ident | num | "(" ws expr ")" ws
ident ::= [a-z] [a-z0-9_]* ws
num   ::= [0-9]+ ws
ws    ::= [ \t\n]*
`.trim();

const CHESS_GRAMMAR = `
# Specifies chess moves as a list in algebraic notation, using PGN conventions

# Force first move to "1. ", then any 1-2 digit number after, relying on model to follow the pattern
root    ::= "1. " move " " move "\n" ([1-9] [0-9]? ". " move " " move "\n")+
move    ::= (pawn | nonpawn | castle) [+#]?

# piece type, optional file/rank, optional capture, dest file & rank
nonpawn ::= [NBKQR] [a-h]? [1-8]? "x"? [a-h] [1-8]

# optional file & capture, dest file & rank, optional promotion
pawn    ::= ([a-h] "x")? [a-h] [1-8] ("=" [NBKQR])?

castle  ::= "O-O" "-O"?
`.trim();

const JSON_GRAMMAR = `
root   ::= object
value  ::= object | array | string | number | ("true" | "false" | "null") ws

object ::=
  "{" ws (
            string ":" ws value
    ("," ws string ":" ws value)*
  )? "}" ws

array  ::=
  "[" ws (
            value
    ("," ws value)*
  )? "]" ws

string ::=
  "\"" (
    [^"\\\x7F\x00-\x1F] |
    "\\" (["\\/bfnrt] | "u" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]) # escapes
  )* "\"" ws

number ::= ("-"? ([0-9] | [1-9] [0-9]*)) ("." [0-9]+)? ([eE] [-+]? [0-9]+)? ws

# Optional space: by convention, applied in this grammar after literal chars when allowed
ws ::= ([ \t\n] ws)?
`.trim();

interface LLMCallOpts {
  stream?: boolean;
  n?: number;
  grammar?: string;
  messages: { content: string; role: string; }[];
}

const parseStream = async (protocol: LLMProtocol, response: Response) => {
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let content = '';
  let previousChunk = '';
  while (true) {
    const { done, value } = await reader.read();
    const chunk = decoder.decode(value, { stream: true });
    try {
      if (chunk === '') {
        console.log('done!')
        return content;

      }
      const parsedChunk = JSON.parse(previousChunk + chunk.split('data:').pop().trim());
      previousChunk = '';
      const parsedResult = parseResult(protocol, parsedChunk, true);
      content += parsedResult;
      console.log(content);
      if (done) {
        console.log('done!')
        return content;
      }
    } catch (err) {
      previousChunk += chunk.split('data:').pop().trim();
      // console.log('previousChunk', previousChunk)
      // console.log('error', err);
      // console.log('chunk that caused the error', chunk);
      // debugger;
    }
  }
};

interface Opts {
  protocol: LLMProtocol;
  endpoint: string;
}

class LLM {
  private protocol: LLMProtocol;
  private endpoint: string;
  constructor(opts: Opts) {
    this.protocol = opts.protocol;
    this.endpoint = opts.endpoint;
  }

  call = async (opts: LLMCallOpts) => {
    const stream = opts.stream;

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prepareOpts(this.protocol, opts))
    });

    if (stream) {
      return parseStream(this.protocol, response);
    }

    const result = await response.json();
    return parseResult(this.protocol, result);
  };
}

const prepareOpts = (protocol: LLMProtocol, opts: LLMCallOpts) => {
  if (protocol === 'openai') {
    return opts;
  } else if (protocol === 'llama.cpp') {
    return {
      prompt: opts.messages[0].content,
      n_predict: opts.n,
      grammar: opts.grammar,
      stream: opts.stream,
    };
  }
  throw new Error('Unsupported protocol');
};

const parseResult = (protocol: LLMProtocol, result: any, streaming = false) => {
  if (protocol === 'openai') {
    if (streaming) {
      return result.choices[0].delta.content;
    }
    return result.choices[0].message.content;
  } else if (protocol === 'llama.cpp') {
    return result.content;
  }
};

interface CallOpts {
  system?: string;
  n?: number;
}

class Newspeak {
  llm: LLM;

  // constructor(opts: Opts | Promise<TextGenerationPipeline> | TextGenerationPipeline) {
  constructor(opts: Opts) {
    this.llm = new LLM(opts);
  }

  call = async (prompt: string, opts: CallOpts = {}) => {
    const messages = [];
    if (opts.system) {
      messages.push({
        "role": "system",
        "content": opts.system,
      });
    }
    messages.push({
      "role": "user",
      "content": prompt,
    });

    const response = await this.llm.call({
      stream: true,
      grammar: CHESS_GRAMMAR,
      n: 40,
      messages,
    });

    return response;
  }
}

for (const [key, protocol, endpoint] of [
  ['llamafile', 'openai', 'http://y7gaevebonopw3pxkknofmd2psbqv3x9l87adpb.thdl.us:4444/v1/chat/completions'],
  ['llama.cpp', 'llama.cpp', 'http://y7gaevebonopw3pxkknofmd2psbqv3x9l87adpb.thdl.us:4445/completion'],
]) {
  console.log(key)
  const newspeak = new Newspeak({
    protocol,
    endpoint,

  });

  console.log(await newspeak.call('Play a game of chess', {
    system: 'You are a champion chess player that only outputs valid PGN'
  }));
}

