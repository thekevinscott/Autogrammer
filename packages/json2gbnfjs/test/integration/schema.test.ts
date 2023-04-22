import { JSON2GBNF, JSONSchema, JSON_VALUE_DEFS, TopLevelJSONSchema, } from "../../src/json2gbnf.js";
import GBNF, { InputParseError, } from 'gbnf';

const OBJECT_GRAMMAR = [`root ::= object`,];
const STREET_SCHEMA = {
  type: 'object',
  properties: {
    number: { type: 'number' },
    street_name: { type: 'string' },
    street_type: { enum: ['Street', 'Avenue', 'Boulevard'] },

  },
};
const STREET_GRAMMAR = [
  `ra ::= "\\"number\\":" number`,
  `rb ::= "\\"street_name\\":" string`,
  `rc ::= "\\"Street\\"" | "\\"Avenue\\"" | "\\"Boulevard\\""`,
  `rd ::= "\\"street_type\\":" rc`,
  `re ::= ra "," rb`,
  `rf ::= ra "," rb "," rd`,
  `rg ::= ra "," rd`,
  `rh ::= ra "," rd "," rb`,
  `ri ::= rb "," ra`,
  `rj ::= rb "," ra "," rd`,
  `rk ::= rb "," rd`,
  `rl ::= rb "," rd "," ra`,
  `rm ::= rd "," ra`,
  `rn ::= rd "," ra "," rb`,
  `ro ::= rd "," rb`,
  `rp ::= rd "," rb "," ra`,
  `root ::= "{" (ra | re | rf | rg | rh | rb | ri | rj | rk | rl | rd | rm | rn | ro | rp)? "}"`,
];

describe('schema', () => {
  const testCases: [
    TopLevelJSONSchema,
    any,
    string[],
  ][] = [
      [{}, '42', [`root ::= value`],],
      [{}, '"42"', [`root ::= value`],],
      [{}, '"string town"', [`root ::= value`],],
      [{}, JSON.stringify({ "an": ["arbitrary", "object"], data: "foo" }), [`root ::= value`],],
      [true, '42', [`root ::= value`],],
      [{ type: 'string' }, '"foo"', [`root ::= string`,],],
      [{
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        type: 'string'
      }, '"foo"', [`root ::= string`,],],
      [{ type: 'number' }, "123", [`root ::= number`,],],
      [{ type: 'number' }, '-123.001', [`root ::= number`,],],
      [{ type: 'boolean' }, 'true', [`root ::= boolean`,],],
      [{ type: 'null' }, 'null', [`root ::= null`,],],
      [{ type: 'string', minLength: 2 }, '"fo"', [`root ::= "\\"" char (char)+ "\\"" `],],
      [{ type: 'string', minLength: 2 }, '"foo"', [`root ::= "\\"" char (char)+ "\\"" `],],
      [{ type: 'string', maxLength: 3 }, '"foo"', [`root ::= "\\"" (char)? (char)? (char)? "\\"" `],],
      [{ type: 'string', minLength: 2, maxLength: 3 }, '"fo"', [`root ::= "\\"" char char (char)? "\\"" `],],
      [{ type: 'string', minLength: 2, maxLength: 3 }, '"foo"', [`root ::= "\\"" char char (char)? "\\"" `],],
      [{ type: 'integer' }, "123", [`root ::= integer`,],],
      [{ type: 'integer' }, "123.0", [`root ::= integer`,],],
      [{ enum: ['red', null, 42] }, `"red"`, [`root ::= "\\"red\\"" | "null" | "42"`,],],
      [{ enum: ['red', null, 42] }, `null`, [`root ::= "\\"red\\"" | "null" | "42"`,],],
      [{ enum: ['red', null, 42] }, `42`, [`root ::= "\\"red\\"" | "null" | "42"`,],],
      [{ type: ['string'] }, '"foo"', [`root ::= string`,],],
      [
        { type: ['string', 'number'] },
        '"foo"',
        [
          `root ::= string | number`,
        ]],
      [
        { type: ['string', 'number', 'boolean', 'null'] },
        '"foo"',
        [
          `root ::= string | number | boolean | null`,
        ],
      ],
      [
        { type: ['string', 'number', 'boolean', 'null', 'array', 'object'] },
        '"foo"',
        [
          `root ::= string | number | boolean | null | array | object`,
        ],
      ],
      [{ type: 'object' }, JSON.stringify({ foo: 'foo', bar: 1, baz: [1,] }), OBJECT_GRAMMAR,],
      [{ type: 'object' }, JSON.stringify({ foo: 'foo', bar: 1, baz: [1,] }), OBJECT_GRAMMAR,],
      [
        STREET_SCHEMA,
        JSON.stringify({ "number": 1600, "street_name": "Pennsylvania", "street_type": "Avenue" }),
        STREET_GRAMMAR,
      ],
      [
        STREET_SCHEMA,
        JSON.stringify({ "number": 10.1, "street_name": "Foo", "street_type": "Boulevard" }),
        STREET_GRAMMAR,
      ],
      [
        STREET_SCHEMA,
        JSON.stringify({ "street_name": "Foo", "number": 10.1, }),
        STREET_GRAMMAR,
      ],
      [
        STREET_SCHEMA,
        JSON.stringify({}),
        STREET_GRAMMAR,
      ],
      [
        STREET_SCHEMA,
        JSON.stringify({ "number": 10.1, "street_name": "Foo", "street_type": "Boulevard" }),
        STREET_GRAMMAR,
      ],
      [
        {
          ...STREET_SCHEMA,
          required: ['number', 'street_type']
        },
        JSON.stringify({ "number": 1600, "street_name": "Foo", "street_type": "Boulevard" }),
        [
          `ra ::= "\\"number\\":" number`,
          `rb ::= "\\"street_name\\":" string`,
          `rc ::= "\\"Street\\"" | "\\"Avenue\\"" | "\\"Boulevard\\""`,
          `rd ::= "\\"street_type\\":" rc`,
          `re ::= ra "," rb "," rd`,
          `rf ::= ra "," rd`,
          `rg ::= ra "," rd "," rb`,
          `rh ::= rb "," ra "," rd`,
          `ri ::= rb "," rd "," ra`,
          `rj ::= rd "," ra`,
          `rk ::= rd "," ra "," rb`,
          `rl ::= rd "," rb "," ra`,
          `root ::= "{" (re | rf | rg | rh | ri | rj | rk | rl) "}"`,
        ],
      ],
      [
        {
          ...STREET_SCHEMA,
          required: ['number', 'street_type']
        },
        JSON.stringify({ "street_type": "Boulevard", "number": 1600 }),
        [
          `ra ::= "\\"number\\":" number`,
          `rb ::= "\\"street_name\\":" string`,
          `rc ::= "\\"Street\\"" | "\\"Avenue\\"" | "\\"Boulevard\\""`,
          `rd ::= "\\"street_type\\":" rc`,
          `re ::= ra "," rb "," rd`,
          `rf ::= ra "," rd`,
          `rg ::= ra "," rd "," rb`,
          `rh ::= rb "," ra "," rd`,
          `ri ::= rb "," rd "," ra`,
          `rj ::= rd "," ra`,
          `rk ::= rd "," ra "," rb`,
          `rl ::= rd "," rb "," ra`,
          `root ::= "{" (re | rf | rg | rh | ri | rj | rk | rl) "}"`,
        ],
      ],
      [
        {
          ...STREET_SCHEMA,
          properties: {
            number: {
              type: 'number',
            },
            country: {
              const: 'USA',
            }
          }
        },
        JSON.stringify({ "number": 1600, "country": "USA", }),
        [
          `ra ::= "\\"number\\":" number`,
          `rb ::= "\\"country\\":\\"USA\\""`,
          `rc ::= ra "," rb`,
          `rd ::= rb "," ra`,
          `root ::= "{" (ra | rc | rb | rd)? "}"`,
        ],
      ],
      [
        {
          ...STREET_SCHEMA,
          properties: {
            number: {
              type: 'number',
            },
            country: {
              const: 'USA',
            }
          }
        },
        JSON.stringify({ "country": "USA", "number": 1600, }),
        [
          `ra ::= "\\"number\\":" number`,
          `rb ::= "\\"country\\":\\"USA\\""`,
          `rc ::= ra "," rb`,
          `rd ::= rb "," ra`,
          `root ::= "{" (ra | rc | rb | rd)? "}"`,
        ],
      ],
      [{ type: 'array' }, JSON.stringify([1, 'a', {}]), [`root ::= array`,],],
      [
        { type: 'array', items: { type: 'number' } },
        JSON.stringify([1, 2, 3]),
        [
          `root ::= "[" (number ("," number)*)? "]"`,
        ],
      ],
      [
        { type: 'array', items: { type: 'number' } },
        JSON.stringify([]),
        [
          `root ::= "[" (number ("," number)*)? "]"`,
        ],
      ],
      [
        { type: 'array', items: { type: ['number', 'string'] } },
        JSON.stringify([1, "foo", 3]),
        [
          `ra ::= number | string`,
          `root ::= "[" (ra ("," ra)*)? "]"`,
        ],
      ],
    ];
  test.each(testCases)('it parses a schema %s to grammar with %s', (schema, initial, expected) => {
    const grammar = JSON2GBNF(schema);
    expect(grammar).toEqual([...expected, ...JSON_VALUE_DEFS].join('\n'));
    let parser = GBNF(grammar);
    parser = parser.add(initial);
    expect(parser.size).toBeGreaterThan(0);
  });

  test.each([
    // [
    //   false,
    //   1,
    //   DEFAULT_SCHEMA,
    // ],
    [{ type: 'string' }, '42', 0],
    [{ type: 'number' }, '"42"', 0],
    // [{
    //   "$schema": "https://json-schema.org/draft/2020-11/schema",
    //   type: 'string'
    // }, 'foo', [
    //   `root ::= string`,
    //   `string ::= ${stringDef}`,
    // ],],
    [{ type: 'string', minLength: 2 }, '"f"', 2],
    [{ type: 'string', minLength: 3 }, '"fo"', 3],
    [{ type: 'string', maxLength: 2 }, '"foo"', 3],
    [{ type: 'string', minLength: 2, maxLength: 2 }, '"f"', 2],
    [{ type: 'string', minLength: 2, maxLength: 2 }, '"foo"', 3],
    [{ type: 'string', minLength: 2, maxLength: 3 }, '"f"', 2],
    [{ type: 'string', minLength: 2, maxLength: 3 }, '"fooo"', 4],
    [{ type: 'integer' }, '-1.5', 3],
    [{ type: 'integer' }, '-1.0001', 6],
    [{ type: 'integer' }, '"42"', 0],
    [{ type: 'boolean' }, '0', 0],
    [{ type: 'object' }, '123', 0],
    [{ type: 'object' }, '"foo"', 0],
    [{ type: 'array' }, JSON.stringify({ foo: 'foo' }), 0,],
    [
      { type: 'array', items: { type: 'number' } },
      JSON.stringify([1, 'a', 3]),
      3,
    ],
    [
      { type: 'array', items: { type: ['number', 'string'] } },
      JSON.stringify([1, "foo", []]),
      9,
    ],
    [{ enum: ['red', null, 42] }, `422`, 2,],
    [{ enum: ['red', null, 42] }, `0`, 0,],
    [
      {
        type: 'object',
        properties: {
          country: {
            const: 'USA',
          }
        }
      },
      JSON.stringify({ "country": "UR" }),
      13,
    ],
    [
      {
        type: 'object',
        properties: {
          country: {
            const: 'USA',
          }
        }
      },
      JSON.stringify({ "country": "USAA" }),
      15,
    ],
  ] as [
    TopLevelJSONSchema,
    string,
    number,
  ][])('it parses a schema %s to grammar and rejects %s', (schema, initial, errorPos) => {
    const grammar = JSON2GBNF(schema);
    let parser = GBNF(grammar);
    expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, errorPos));
  });
});
