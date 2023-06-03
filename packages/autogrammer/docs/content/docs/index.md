---
title: 'Introduction'
layout: 'layouts/page.html'
displayOrder: 0
---

LLMs don't always do what you tell them to do.

For instance, you can try to ask an LLM to generate some JSON output:

```javascript
import { pipeline, } from '@xenova/transformers'

const model = await pipeline('text-generation', 'Xenova/gpt2')

const result = await model('Write me a JSON array of 3 numbers:\n')
console.log(result[0].generated_text)
```

_<small>All code snippets are editable.</small>_

Sometimes it'll generate what you want - sometimes it won't. Sometimes it'll wrap it in surrounding text, sometimes it won't. The smaller the model, the harder it will be to control the output.


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
