---
title: 'Getting Started'
layout: 'layouts/page.html'
displayOrder: 1

eleventyNavigation:
  parent: docs
  key: getting-started
  title: "Getting Started"
  order: 1
---

## Installation

You can install `autogrammer` with:

```bash
npm install autogrammer
```
## Quick Start

```javascript
import { autogram } from 'autogrammer'

const prompt = `Return the following address in a JSON object: 

"1600 Pennsylvania Avenue NW, Washington, DC 20500"`

const result = await autogram(prompt, 'json')
console.log(result)
```
