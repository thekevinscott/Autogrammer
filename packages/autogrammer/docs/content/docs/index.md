---
title: 'Motivation'
layout: 'layouts/page.html'
displayOrder: 0
eleventyNavigation:
  parent: docs
  key: motivation
  title: "Motivation"
  order: 0
---


## LLMs don't always cooperate.

Try asking an LLM to generate some JSON output:

```javascript

import { pipeline, } from '@xenova/transformers'

const model = await pipeline(
  'text-generation', 
  'Xenova/gpt2',
)

const result = await model('Write me a JSON array of 3 numbers:\n')
console.log(result[0].generated_text)

```

Sometimes it generates the text you ask for, sometimes it doesn't. Sometimes it gives it to you but wraps it in explanatory surrounding text.

The smaller the model, the harder it is to control its output.

## Autogrammer

`autogrammer` constrains a model's output to a pre-defined pattern using a [_grammar_](https://en.wikipedia.org/wiki/Context-free_grammar). The LLM is forced to choose from a limited subset of tokens in specific orders, resulting in syntactically valid output.

Autogrammer accepts JSON schemas or SQL databases to constrain the model's output even further.

## Use Cases

Constraining a model's output means you can run a smaller model that will be more capable, and the smaller model, the more effectively it runs in the browser.

Try it:

```javascript

import { autogram } from 'autogrammer';
const result = await autogram('Write me a JSON array of 3 numbers:\n', 'json')
console.log(result)

```

Live code generation in the browser opens up some interesting use cases. Here's some that I can think of:

- 💻 Live code generation in the browser
- 🗣️ Natural language to SQL conversion
- 🎇 Generating visualizations from text descriptions
- 🌳 Offline apps
- 🕵️ When you want your data staying private
- 📄 OpenAPI spec to JSON output.
