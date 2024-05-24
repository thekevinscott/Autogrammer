---
title: 'Getting Started'
layout: 'layouts/page.html'
displayOrder: 2
---

## Installation

You can install `autogrammer` with:

```bash
npm install
```

## Quick Start

```javascript
import { pipeline, } from '@xenova/transformers'
import Autogrammer from 'autogrammer'

const autogrammer = new Autogrammer({
  language: 'json',
  model: pipeline('text-generation', 'Xenova/gpt2'),
})

const prompt = `Return the following address in a JSON object: 

"1600 Pennsylvania Avenue NW, Washington, DC 20500"`;

const result = await autogrammer.execute(prompt, {})
```
