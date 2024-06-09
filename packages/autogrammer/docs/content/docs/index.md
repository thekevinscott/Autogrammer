---
title: 'Motivation'
layout: 'layouts/page.html'
displayOrder: 0
eleventyNavigation:
  key: Humans
  parent: Mammals
  order: 0
---


**LLMs don't always do what you tell them to do.**

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

Sometimes it'll generate what you want; but sometimes it won't. Sometimes it'll wrap it in surrounding text; sometimes it won't. 

The smaller the model, the harder it is to control its output.

`autogrammer` constrains a model's output to a pre-defined pattern using a _grammar_. The LLM must generate a specific subset tokens in specific orders, resulting in syntactically valid output. Specifying a JSON schema or SQL database can constrain the output even further.

This means you can run a smaller model, and the smaller model, the more effectively it runs in the browser.

Live code generation in the browser opens up some interesting use cases, including:

- 💻 Live code generation in the browser
- 🗣️ Natural language to SQL conversion
- 🎇 Generating visualizations from text descriptions
- 🌳 Offline apps
- 🕵️ When you want your data staying private
- OpenAPI spec to JSON output.

And more.

[Get started with Autogrammer now](getting-started/).
