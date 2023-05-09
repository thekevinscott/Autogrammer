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
import Autogrammer from 'autogrammer';

const grammer = new Autogrammer({
  language: 'json',
});

const prompt = `Return the following address in a JSON object:

1600 Pennsylvania Avenue NW, Washington, DC 20500`;

const result = await grammar.prompt(prompt);
```
