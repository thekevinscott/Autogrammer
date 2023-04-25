import { Antlr4Parser } from '../../../packages/autogrammer/src/index.js';
const parser = new Antlr4Parser();
for (const code of [
  // `function foo() {}`,
  // `function foo() {`,
  // `bar`,
  `bar = `,
  // `|`,
  // "def foo():",
  // "def ():",
  // "def foo(): return ",
  // "foo foobert",
  // `const var1 = 1;\nvar foo = "2"; foo var`,
  // 'http',
  // 'http:',
  'http://',
  // '[',
  // '$',
  // 'www',

  //   {
  //     code: `fun test() {
  //     try {
  //         doSomething()
  //     }

  // `,
  //   },
  //   {
  //     code: `fun test() {
  //     try {
  //         doSomething()
  //     } ca`,
  //   },
  //   {
  //     code: `fun test() {
  //     try {
  //         doSomething()
  //     } catch`,
  //   },
  //   {
  //     code: `fun test foobert
  //     `,
  //   },
  // {
  //   code: `fun test() {
  //   val v = 1
  //   val z = `,
  // },
  // {
  //   code: `fun fooBARbaz() {
  //   val v = 1
  //   val z = `,
  //   caretPosition: { line: 3, column: 13 }, // this is required
  // },
  //   {
  //     code: `fun fooBARbaz() {
  //     val v = 1
  //     val z = 
  // `,
  //     caretPosition: { line: 3, column: 13 }, // this is required
  //   },
  /*
  {
    code: `fun test1() {
    val k = 'a'
}

fun test2() {
    val v = 1
    val z = 
}`,
    caretPosition: { line: 7, column: 13 }, // this is required
  },
  {
    code: `fun test() {
    val someVariable = 1
    val anotherVariable = 2
    val z = so
}`,
    caretPosition: { line: 4, column: 14 },

  },
  {

    code: `val v = 1
fun test() {
    val z = 
}`,
    caretPosition: { line: 3, column: 13 },
  },
  {
    code: `val v = 1
fun test() {
    print( )
}`,
    caretPosition: { line: 3, column: 11 },
  }
  */
]) {
  // await parser.getSuggestions(code, caretPosition);
  const isValid = await parser.checkIfProgramIsValid(code);
  console.log(`code "${code}": ${isValid ? 'valid' : 'invalid'}`);
  console.log('--------------------')
}

