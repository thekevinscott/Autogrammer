<center>
<h1>Autogrammer</h1>

<a href="https://www.npmjs.com/package/autogrammer"><img alt="Latest Autogrammer NPM Version" src="https://badge.fury.io/js/autogrammer.svg" /></a>
<a href="https://github.com/thekevinscott/autogrammer/blob/master/LICENSE"><img alt="License for Autogrammer" src="https://img.shields.io/npm/l/autogrammer" /></a>
<a href="https://www.npmjs.com/package/autogrammer"><img alt="Downloads per week on NPM for Autogrammer" src="https://img.shields.io/npm/dw/autogrammer" /></a>
</center>

Autogrammer constrains the output of language models (LLMs) to generate syntactically valid JSON or SQL. 

By leveraging grammars, Autogrammer ensures that an LLM generates output adhering to specific structures and syntax, even with smaller models. 

_Autogrammer is still being actively developed and should be considered in alpha_

## Use Cases

- 💻 Live code generation in the browser
- 🗣️ Natural language to SQL conversion
- 🎇 Generating visualizations from text descriptions
- 🌳 Offline apps
- 🕵️ When you want your data staying private

## Key features

- **Bring your own model** &mdash; Works seamlessly with `Transformers.js`, `web-llm`, and REST endpoints for `llama.cpp` and `llamafile`, allowing you to use your preferred LLM.

- **Support for `JSON` and `SQL`** &mdash; With syntactic validity guaranteed by GBNF grammars.

- **Schema support** &mdash; Provide schemas** (database schema or JSON schema) to further restrict possible output and ensure semantic correctness.

- **Plugins** &mdash; (*Coming soon*) Enable additional functionality, such as RAG, on-the-fly error correction, and more.

## Installation

```bash
npm install autogrammer
```

## Quickstart

```javascript
import { pipeline } from '@xenova/transformers'
import { Autogrammer } from 'autogrammer'

// Load your preferred model
const model = pipeline('text-generation', 'Xenova/gpt2')

// Create Autogrammer for JSON output
const autogrammer = new Autogrammer({
  language: 'json',
})

// Tell the model what to generate
const prompt = 'Write me JSON that captures the following address: 1600 Pennsylvania Avenue NW, Washington, DC 20500'

// Run
const response = await autogrammer.execute(prompt)

// See the generated JSON
console.log(response) // { ... json object }
```

## Packages

Autogrammer is made up of a number of subpackages that each make up the library:

- [`gbnf`](packages/gbnf/README.md) - Parses a GBNF grammar into a graph of rules, which can be used to determine the validity of a next token. Also enables the creation of GBNF grammars dynamically.
- [`json2gbnf`](packages/json2gbnf/javascript) - Generates a GBNF grammar for JSON, with optional JSON schema
- [`sql2gbnf`](packages/sql2gbnf/javascript) - Generates a GBNF grammar for SQL, with optional database schema
- [`contortionist`](packages/contort/README.md) - Implements a Logits post-processor that restricts LLM output to only include valid next tokens
- [`autogrammer`](packages/autogrammer/javascript/) - Orchestrates support for SQL and JSON grammar generation with a variety of LLM models.

## License

[MIT](LICENSE)
