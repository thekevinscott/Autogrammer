---
title: 'Introduction'
layout: 'layouts/page.html'
displayOrder: 0
---

Sometimes LLMs don't do what you want them to do.  For instance, you can ask an LLM to generate a code output:

```javascript
import { pipeline, } from '@xenova/transformers'

const model = await pipeline('text-generation', 'Xenova/gpt2')

const result = await model('Write me a list of numbers:\n')
console.log('result', result)
```

Sometimes it'll generate what you want - sometimes it won't. Sometimes it'll wrap it in surrounding text, sometimes it won't. The smaller the model, the harder it will be to control the output.

_A quick note - all the code snippets on this site are editable. Some of them, like the one above, have a simulation running to avoid unnecessary computation, but at any point you can jump in and play with it._

`autogrammer` exists to constrain a model's output to a pre-defined pattern called a _grammar_. The LLM is constrained to only be able to generate specific tokens at specific parts, resulting in syntactically valid output. We can also restrict it further, specifying JSON schemas or SQL with specific tables and columns.

This means that you can get by with running a smaller model. And the smaller model, the more effectively it can run in the browser.

Having live code generation in the browser that is competitive with GPT-3.5 opens up some interesting use cases:

- A web component that automatically writes its own HTML and Javascript based on a text prompt
- Convert natural language to SQL, directly in your browser. Embed it in some sort of tool.
- Automatically go from an OpenAPI spec to JSON output.
- Interactive visualizations (ooh, see if I can leverage datasette)a Allow users to input natural language descriptions of desired data visualizations. autogrammer can generate the necessary JavaScript code to render the visualizations using popular libraries like D3.js or Chart.js.
- Something that reads a web page, pulls in all the forms, and generates output for it
- Offline, on-device, or privacy-focused use cases in Node. Local CLI, for instance.
- HTML Canvas Code Generator:
- JavaScript Animation Snippet Generator:
- A tool that allows users to paste in HTML code and it generates the corresponding Markdown code.
- Myspace style CSS: Users describe the layout structure they want (number of rows and columns, size of gaps, etc.), and autogrammer generates the CSS Grid properties to make it happen.

Next, we'll see how to install and get started.
