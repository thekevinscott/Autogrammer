# Contortionist

<a href="https://www.npmjs.com/package/contort"><img alt="Latest Contortionist NPM Version" src="https://badge.fury.io/js/contort.svg" /></a>
<a href="https://github.com/thekevinscott/contortionist/blob/master/LICENSE"><img alt="License for contortionist" src="https://img.shields.io/npm/l/contortionist" /></a>
<a href="https://www.npmjs.com/package/cnotort"><img alt="Downloads per week on NPM for contortionist" src="https://img.shields.io/npm/dw/contort" /></a>
<a href="https://github.com/thekevinscott/contortionist/actions/workflows/tests.yaml"><img src="https://github.com/thekevinscott/contortionist/actions/workflows/tests.yaml/badge.svg" alt="Status of tests for contortionist repository" /></a>
<a href="https://codecov.io/gh/thekevinscott/contortionist"><img alt="Code Coverage for contortionist" src="https://img.shields.io/codecov/c/github/thekevinscott/contortionist" /></a>
<a href="https://deepsource.io/gh/thekevinscott/contortionist/?ref=repository-badge"><img alt="DeepSource issues for contortionist" src="https://deepsource.io/gh/thekevinscott/contortionist.svg/?label=active+issues&show_trend=true" /></a>

Control what LLMs can, and can't, say.

## Install

```bash
npm install contortionist
```

## Usage

```javascript
import Contortionist from 'contortionist';
const grammar = 'root ::= "foo"';
const contortionist = new Contortionist({
  grammar,
  model: {
    protocol: 'llama.cpp',
    endpoint: 'http://localhost:4445',
  },
});

const result = await contortionist.execute(prompt, {
  n: 40,
  stream: true,
  callback: ({ partial }) => {
    output.textContent = partial;
  }
});
```
