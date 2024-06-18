---
title: 'API'
layout: 'layouts/page.html'
displayOrder: 6

eleventyNavigation:
  parent: docs
  key: api
  title: "API"
  order: 6
---

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
