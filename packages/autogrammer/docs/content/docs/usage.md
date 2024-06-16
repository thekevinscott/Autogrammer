---
title: 'Usage'
layout: 'layouts/page.html'
displayOrder: 2
eleventyNavigation:
  parent: docs
  key: usage
  title: "Usage"
  order: 2
---

Autogrammer needs a prompt, and you can additionally provide language options and chosen model.

Read about the three parameters below:

- [Prompts]()
- [Languages]()
- [Models]()

## Prompts

Which prompts work best depend a lot on the model you're using. Experimentation, having evaluation sets are important.

Some specific Autogrammer tips:

- Ensure you phrase the question to best help the model. If you are expecting JSON output, still explicitly mention that in the prompt.
- If you are providing a schema, Autogrammer automatically includes it in the prompt. No need to re-supply it in the prompt.
- 

You create an instance of `Autogrammer` to do anything:

```javascript
import {autogram} from 'autogrammer';

const autogrammer = autogram('Tell me model, what ails you?', _`"headache" | "cold"`)
```

To begin to work with `autogrammer`, you need to choose a language and (optionally) a model.

## Languages

Autogrammer supports the following languages:

- `json`
- `sql`

You can specify one the `output` parameter:

```javascript
import Autogrammer from 'autogrammer';

const grammer = new Autogrammer({
  language: 'json',
});
```

See the section on languages for more.

## Models

Autogrammer has a "bring-your-own-model" philosophy, allowing you to pick and choose which LLMs to interact with.

`Autogrammer` works a variety of LLMs and backends, including:

- Transformers.js 
- web-llm
- llama.cpp (exposed as a REST interface)
- llamafile (exposed as a REST interface)

You can choose which model and backend to run independently of `Autogrammer`.

### Javascript Libraries

#### Transformers.js

```
import { pipeline, } from '@xenova/transformers'

const model = await pipeline('text-generation', 'Xenova/gpt2')

const grammer = new Autogrammer({
  language: 'json',
  model,
})
```

#### web-llm

```javascript
import Autogrammer from 'autogrammer';
import * as webllm from '@mlc-ai/web-llm';
const selectedModel = "Phi1.5-q4f32_1-1k";

const model = webllm.CreateEngine(selectedModel);

const grammer = new Autogrammer({
  language: 'json',
  model,
});
```

### Server LLMs 

#### llama.cpp
#### llamafile

See the section on models for more.

