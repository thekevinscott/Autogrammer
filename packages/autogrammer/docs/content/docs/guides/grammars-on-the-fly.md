---
title: 'Grammars on the Fly'
layout: 'layouts/page.html'
displayOrder: 0
eleventyNavigation:
  parent: guides
  key: grammars-on-the-fly
  title: "Grammars on the Fly"
  order: 0
---

You can specify grammars on the fly using Autogrammer's `_` function. Let's see how it works.

## A binary grammar

Grammars are defined as GBNF files ([read about GBNF here](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md)). You can supply GBNF directly, but I find GBNF difficult to write by hand, particularly when it's generated dynamically.

Autogrammer offers, in my opinion, an easier way to write GBNF.

To write a binary grammar:

```javascript
import {_} from 'autogrammer'
_`"one" | "two"`
```

This produces the following GBNF:

```gbnf
root ::= "one" | "two"
```

You can see the GBNF `_` produces with `.compile()`:

```javascript
import {_} from 'autogrammer'
console.log(_`"one" | "two"`.compile())
```

## A multi-choice grammar

You can specify multiple choices for the model to choose:

```javascript
import {_} from 'autogrammer'
_`"apples" | "bananas" | "carrots"
```

If you want choices with more than one word, make sure to wrap them in parentheses:

```javascript
import {_} from 'autogrammer'
_`"apples" | "bananas" | "carrots" | ("grape fruit")`
```

## Rules

As your grammar grows, you will start creating rules. Rules are reusable snippets of GBNF that can be referenced by name.

`_` automatically takes care of managing names and referencing rules. Every `_` invocation makes a rule, and you can nest `_`s to create references to rules:

```javascript
import {_} from 'autogrammer'

// the first rule is for a positive integer
// the second rule is for a quoted string
console.log(_`
  ${_`[0] | ([1-9] [0-9]*)`}
  | ${_`"\\"" [^'"]+ "\\""`}
`.compile())
```

`_` automatically takes care of linking the rules together.

You can embed logic in the template tags as well:

```javascript
import {_} from 'autogrammer'

const weAreUsing = 'strings';

// if weAreUsing is string, we will return the string rule,
// otherwise the integer rule
console.log(_`
  ${weAreUsing === 'number' 
    ? _`[0] | ([1-9] [0-9]*)` 
    : _`"\\"" [^'"]+ "\\""`}
`.compile())
```

You can define rules as Javascript variables and reference them later:

```javascript
import {_} from 'autogrammer'

const positiveInteger = _`[0] | ([1-9] [0-9]*)`
const stringWithQuotes = _`"\\"" [^'"]+ "\\""`
console.log(_`
  ${positiveInteger}
  | ${stringWithQuotes}
`.compile())
```

## Other examples

Below are some examples of simple constrained grammars that might be useful:

- [A list](#a-list)

### A list

```javascript
import {_} from 'autogrammer'

const line = _`"-" [^-]* "\\n"`;
console.log(_`
  ${line}
  (${line})*
`.compile())
```

Another way to write the above is by calling the function `.wrap()`:

```javascript
import {_} from 'autogrammer'

const line = _`"-" [^-]* "\\n"`;
console.log(_`
  ${line}
  ${
    line.wrap('*') // here we automatically mark our rule as 'zero and up'
  }
`.compile())
```
