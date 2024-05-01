---
title: 'Usage'
layout: 'layouts/page.html'
displayOrder: 3
---

## Languages

Autogrammer currently supports the following output formats:

- `JSON`
- `SQL`

You can specify with the `output` parameter:

```javascript
import Autogrammer from 'autogrammer';

const grammer = new Autogrammer({
  language: 'sql',
});
```

## Models

Autogrammer works with a variety of LLMs and backends, including:

- Transformers.js 
- web-llm
- llama.cpp (exposed as a REST interface)
- llamafile (exposed as a REST interface)

You can specify a model by passing it as the `model`:

```javascript
import Autogrammer from 'autogrammer';
import * as webllm from '@mlc-ai/web-llm';
const selectedModel = "Phi1.5-q4f32_1-1k";

const model = webllm.CreateEngine(selectedModel);

const grammer = new Autogrammer({
  model,
});
```

Here's examples of each supported backend:

## API

Autogrammer's primary method is the `execute` method.

### `prompt`

You prompt with:

```javascript
const grammer = new Autogrammer({
  language: 'json',
});
console.log(await grammer.prompt('My prompt'))
```

By default, Autogrammer returns string output.

#### Language Options

You can pass in language options as `languageOptions` in the second argument:

```javascript
const grammer = new Autogrammer({
  language: 'json',
});

console.log(await grammer.prompt('My prompt', {
  languageOptions: {
    type: 'object',
    // some JSON schema
  },
}))
```

Each language accepts different options:

- **JSON**: `languageOptions` can optionally be a JSON schema the output must adhere to. (Only a subset of JSON schema functionality is supported.)
- **SQL**: `languageOptions` can optionally be a string database schema.

#### Model Options

You can pass in options for the model as `modelOptions` in the second argument:

```javascript
const grammer = new Autogrammer({
  language: 'json',
});

console.log(await grammer.prompt('My prompt', {
  modelOptions: {
    n: 100,
    temperature: 1,
  }
}))
```

Refer to each backend's API for model options. For your convenience, links are here:

- Transformers.js 
- web-llm
- llama.cpp (exposed as a REST interface)
- llamafile (exposed as a REST interface)

## Plugins

PLUGINS OH MY
