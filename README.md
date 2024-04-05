# CodeSynth

<a href="https://www.npmjs.com/package/codesynth"><img alt="Latest CodeSynth NPM Version" src="https://badge.fury.io/js/codesynth.svg" /></a>
<a href="https://github.com/thekevinscott/codesynth/blob/master/LICENSE"><img alt="License for CodeSynth" src="https://img.shields.io/npm/l/codesynth" /></a>
<a href="https://www.npmjs.com/package/cnotort"><img alt="Downloads per week on NPM for CodeSynth" src="https://img.shields.io/npm/dw/codesynth" /></a>
<a href="https://github.com/thekevinscott/codesynth/actions/workflows/tests.yml"><img src="https://github.com/thekevinscott/codesynth/actions/workflows/tests.yml/badge.svg" alt="Status of tests for CodeSynth repository" /></a>
<a href="https://codecov.io/gh/thekevinscott/codesynth"><img alt="Code Coverage for CodeSynth" src="https://img.shields.io/codecov/c/github/thekevinscott/codesynth" /></a>
<a href="https://deepsource.io/gh/thekevinscott/codesynth/?ref=repository-badge"><img alt="DeepSource issues for CodeSynth" src="https://deepsource.io/gh/thekevinscott/codesynth.svg/?label=active+issues&show_trend=true" /></a>

CodeSynth is a JS library for generating syntactically valid code from an LLM. It achieves this by leveraging grammars to restrain LLM tokens.

## Quickstart

```javascript
const synth = new Codesynth({
  language: 'json', // specify the language
  model: { // specify the model backend
    protocol: 'llama.cpp',
    endpoint: '/some/path/to/llama.cpp/server',
  }
});
const result = await synth.synthesize(prompt, {
  n: 100, // max number of tokens
  stream: true, // whether to stream or not
  streamCallback: ({ chunk, partial }) => {
    console.log(partial) // if streaming, the partially created string output
    console.log(chunk) // the full chunk output from the LLM
  }
});
```

## Supported Languages

- JSON

Support is planned for SQL, Python, and Javascript.

## Supported LLMs

Currently the following LLM frameworks are supported:

- llama.cpp
