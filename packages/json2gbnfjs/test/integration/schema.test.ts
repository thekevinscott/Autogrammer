import { GLOBAL_CONSTANTS } from "../../src/constants/constants.js";
import { JSON2GBNF, } from "../../src/json2gbnf.js";
import GBNF, { InputParseError, } from 'gbnf';
import type { TopLevelJSONSchema } from "../../src/types.js";
import {
  ARRAY_KEY,
  BOOLEAN_KEY,
  CHAR_KEY,
  COLON_KEY,
  COMMA_KEY,
  INTEGER_KEY,
  LEFT_BRACE_KEY,
  LEFT_BRACKET_KEY,
  NULL_KEY,
  NUMBER_KEY,
  OBJECT_KEY,
  QUOTE_KEY,
  RIGHT_BRACE_KEY,
  RIGHT_BRACKET_KEY,
  STRING_KEY,
  VALUE_KEY,
} from "../../src/constants/grammar-keys.js";

const OBJECT_GRAMMAR = [`root ::= ${OBJECT_KEY}`,];
const STREET_SCHEMA = {
  type: 'object',
  properties: {
    number: { type: 'number' },
    street_name: { type: 'string' },
    street_type: { enum: ['Street', 'Avenue', 'Boulevard'] },

  },
};
const STREET_GRAMMAR = [
  `xa ::= ${QUOTE_KEY} "number" ${QUOTE_KEY} ${COLON_KEY} ${NUMBER_KEY}`,
  `xb ::= ${QUOTE_KEY} "street_name" ${QUOTE_KEY} ${COLON_KEY} ${STRING_KEY}`,
  `xc ::= ${QUOTE_KEY} "Street" ${QUOTE_KEY} | ${QUOTE_KEY} "Avenue" ${QUOTE_KEY} | ${QUOTE_KEY} "Boulevard" ${QUOTE_KEY}`,
  `xd ::= ${QUOTE_KEY} "street_type" ${QUOTE_KEY} ${COLON_KEY} xc`,
  `xe ::= xa ${COMMA_KEY} xb`,
  `xf ::= xa ${COMMA_KEY} xb ${COMMA_KEY} xd`,
  `xg ::= xa ${COMMA_KEY} xd`,
  `xh ::= xa ${COMMA_KEY} xd ${COMMA_KEY} xb`,
  `xi ::= xb ${COMMA_KEY} xa`,
  `xj ::= xb ${COMMA_KEY} xa ${COMMA_KEY} xd`,
  `xk ::= xb ${COMMA_KEY} xd`,
  `xl ::= xb ${COMMA_KEY} xd ${COMMA_KEY} xa`,
  `xm ::= xd ${COMMA_KEY} xa`,
  `xn ::= xd ${COMMA_KEY} xa ${COMMA_KEY} xb`,
  `xo ::= xd ${COMMA_KEY} xb`,
  `xp ::= xd ${COMMA_KEY} xb ${COMMA_KEY} xa`,
  `root ::= ${LEFT_BRACE_KEY} (xa | xe | xf | xg | xh | xb | xi | xj | xk | xl | xd | xm | xn | xo | xp)? ${RIGHT_BRACE_KEY}`,
];

describe('schema', () => {
  const successTestCases: [
    TopLevelJSONSchema,
    any,
    string[],
  ][] = [
      [{}, '42', [`root ::= ${VALUE_KEY}`],],
      [{}, '"42"', [`root ::= ${VALUE_KEY}`],],
      [{}, '"string town"', [`root ::= ${VALUE_KEY}`],],
      [{}, JSON.stringify({ "an": ["arbitrary", "object"], data: "foo" }), [`root ::= ${VALUE_KEY}`],],
      [true, '42', [`root ::= ${VALUE_KEY}`],],
      [{ type: 'string' }, '"foo"', [`root ::= ${STRING_KEY}`,],],
      [{
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        type: 'string'
      }, '"foo"', [`root ::= ${STRING_KEY}`,],],
      [{ type: 'number' }, "123", [`root ::= ${NUMBER_KEY}`,],],
      [{ type: 'number' }, '-123.001', [`root ::= ${NUMBER_KEY}`,],],
      [{ type: 'boolean' }, 'true', [`root ::= ${BOOLEAN_KEY}`,],],
      [{ type: 'null' }, 'null', [`root ::= ${NULL_KEY}`,],],
      [{ type: 'string', minLength: 2 }, '"fo"', [`root ::= ${QUOTE_KEY} ${CHAR_KEY} (${CHAR_KEY})+ ${QUOTE_KEY}`],],
      [{ type: 'string', minLength: 2 }, '"foo"', [`root ::= ${QUOTE_KEY} ${CHAR_KEY} (${CHAR_KEY})+ ${QUOTE_KEY}`],],
      [{ type: 'string', maxLength: 3 }, '"foo"', [`root ::= ${QUOTE_KEY} (${CHAR_KEY})? (${CHAR_KEY})? (${CHAR_KEY})? ${QUOTE_KEY}`],],
      [{ type: 'string', minLength: 2, maxLength: 3 }, '"fo"', [`root ::= ${QUOTE_KEY} ${CHAR_KEY} ${CHAR_KEY} (${CHAR_KEY})? ${QUOTE_KEY}`],],
      [{ type: 'string', minLength: 2, maxLength: 3 }, '"foo"', [`root ::= ${QUOTE_KEY} ${CHAR_KEY} ${CHAR_KEY} (${CHAR_KEY})? ${QUOTE_KEY}`],],
      [{ type: 'integer' }, "123", [`root ::= ${INTEGER_KEY}`,],],
      [{ type: 'integer' }, "123.0", [`root ::= ${INTEGER_KEY}`,],],
      [{ enum: ['red', null, 42] }, `"red"`, [`root ::= "\\"red\\"" | ${NULL_KEY} | "42"`,],],
      [{ enum: ['red', null, 42] }, `null`, [`root ::= "\\"red\\"" | ${NULL_KEY} | "42"`,],],
      [{ enum: ['red', null, 42] }, `42`, [`root ::= "\\"red\\"" | ${NULL_KEY} | "42"`,],],
      [{ enum: ['red', null, 42] }, `42`, [`root ::= "\\"red\\"" | ${NULL_KEY} | "42"`,],],
      [{ type: ['string'] }, '"foo"', [`root ::= ${STRING_KEY}`,],],
      [
        { type: ['string', 'number'] },
        '"foo"',
        [
          `root ::= ${STRING_KEY} | ${NUMBER_KEY}`,
        ]],
      [
        { type: ['string', 'number', 'boolean', 'null'] },
        '"foo"',
        [
          `root ::= ${STRING_KEY} | ${NUMBER_KEY} | ${BOOLEAN_KEY} | ${NULL_KEY}`,
        ],
      ],
      [
        { type: ['string', 'number', 'boolean', 'null', 'array', 'object'] },
        '"foo"',
        [
          `root ::= ${STRING_KEY} | ${NUMBER_KEY} | ${BOOLEAN_KEY} | ${NULL_KEY} | ${ARRAY_KEY} | ${OBJECT_KEY}`,
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
          `xa ::= ${QUOTE_KEY} "number" ${QUOTE_KEY} ${COLON_KEY} ${NUMBER_KEY}`,
          `xb ::= ${QUOTE_KEY} "street_name" ${QUOTE_KEY} ${COLON_KEY} ${STRING_KEY}`,
          `xc ::= ${QUOTE_KEY} "Street" ${QUOTE_KEY} | ${QUOTE_KEY} "Avenue" ${QUOTE_KEY} | ${QUOTE_KEY} "Boulevard" ${QUOTE_KEY}`,
          `xd ::= ${QUOTE_KEY} "street_type" ${QUOTE_KEY} ${COLON_KEY} xc`,
          `xe ::= xa ${COMMA_KEY} xb ${COMMA_KEY} xd`,
          `xf ::= xa ${COMMA_KEY} xd`,
          `xg ::= xa ${COMMA_KEY} xd ${COMMA_KEY} xb`,
          `xh ::= xb ${COMMA_KEY} xa ${COMMA_KEY} xd`,
          `xi ::= xb ${COMMA_KEY} xd ${COMMA_KEY} xa`,
          `xj ::= xd ${COMMA_KEY} xa`,
          `xk ::= xd ${COMMA_KEY} xa ${COMMA_KEY} xb`,
          `xl ::= xd ${COMMA_KEY} xb ${COMMA_KEY} xa`,
          `root ::= ${LEFT_BRACE_KEY} (xe | xf | xg | xh | xi | xj | xk | xl) ${RIGHT_BRACE_KEY}`,
        ],
      ],
      [
        {
          ...STREET_SCHEMA,
          required: ['number', 'street_type']
        },
        JSON.stringify({ "street_type": "Boulevard", "number": 1600 }),
        [
          `xa ::= ${QUOTE_KEY} "number" ${QUOTE_KEY} ${COLON_KEY} ${NUMBER_KEY}`,
          `xb ::= ${QUOTE_KEY} "street_name" ${QUOTE_KEY} ${COLON_KEY} ${STRING_KEY}`,
          `xc ::= ${QUOTE_KEY} "Street" ${QUOTE_KEY} | ${QUOTE_KEY} "Avenue" ${QUOTE_KEY} | ${QUOTE_KEY} "Boulevard" ${QUOTE_KEY}`,
          `xd ::= ${QUOTE_KEY} "street_type" ${QUOTE_KEY} ${COLON_KEY} xc`,
          `xe ::= xa ${COMMA_KEY} xb ${COMMA_KEY} xd`,
          `xf ::= xa ${COMMA_KEY} xd`,
          `xg ::= xa ${COMMA_KEY} xd ${COMMA_KEY} xb`,
          `xh ::= xb ${COMMA_KEY} xa ${COMMA_KEY} xd`,
          `xi ::= xb ${COMMA_KEY} xd ${COMMA_KEY} xa`,
          `xj ::= xd ${COMMA_KEY} xa`,
          `xk ::= xd ${COMMA_KEY} xa ${COMMA_KEY} xb`,
          `xl ::= xd ${COMMA_KEY} xb ${COMMA_KEY} xa`,
          `root ::= ${LEFT_BRACE_KEY} (xe | xf | xg | xh | xi | xj | xk | xl) ${RIGHT_BRACE_KEY}`,
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
          `xa ::= ${QUOTE_KEY} "number" ${QUOTE_KEY} ${COLON_KEY} ${NUMBER_KEY}`,
          `xb ::= ${QUOTE_KEY} "country" ${QUOTE_KEY} ${COLON_KEY} ${QUOTE_KEY} "USA" ${QUOTE_KEY}`,
          `xc ::= xa ${COMMA_KEY} xb`,
          `xd ::= xb ${COMMA_KEY} xa`,
          `root ::= ${LEFT_BRACE_KEY} (xa | xc | xb | xd)? ${RIGHT_BRACE_KEY}`,
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
          `xa ::= ${QUOTE_KEY} "number" ${QUOTE_KEY} ${COLON_KEY} ${NUMBER_KEY}`,
          `xb ::= ${QUOTE_KEY} "country" ${QUOTE_KEY} ${COLON_KEY} ${QUOTE_KEY} "USA" ${QUOTE_KEY}`,
          `xc ::= xa ${COMMA_KEY} xb`,
          `xd ::= xb ${COMMA_KEY} xa`,
          `root ::= ${LEFT_BRACE_KEY} (xa | xc | xb | xd)? ${RIGHT_BRACE_KEY}`,
        ],
      ],
      [{ type: 'array' }, JSON.stringify([1, 'a', {}]), [`root ::= ${ARRAY_KEY}`,],],
      [
        { type: 'array', items: { type: 'number' } },
        JSON.stringify([1, 2, 3]),
        [
          `root ::= ${LEFT_BRACKET_KEY} (${NUMBER_KEY} (${COMMA_KEY} ${NUMBER_KEY})*)? ${RIGHT_BRACKET_KEY}`,
        ],
      ],
      [
        { type: 'array', items: { type: 'number' } },
        JSON.stringify([]),
        [
          `root ::= ${LEFT_BRACKET_KEY} (${NUMBER_KEY} (${COMMA_KEY} ${NUMBER_KEY})*)? ${RIGHT_BRACKET_KEY}`,
        ],
      ],
      [
        { type: 'array', items: { type: ['number', 'string'] } },
        JSON.stringify([1, "foo", 3]),
        [
          `xa ::= ${NUMBER_KEY} | ${STRING_KEY}`,
          `root ::= ${LEFT_BRACKET_KEY} (xa (${COMMA_KEY} xa)*)? ${RIGHT_BRACKET_KEY}`,
        ],
      ],
    ];
  test.each(successTestCases)('it parses a schema %s to grammar with %s', (schema, initial, expected) => {
    const grammar = JSON2GBNF(schema);
    expect(grammar).toEqual([...expected, ...GLOBAL_CONSTANTS].join('\n'));
    let parser = GBNF(grammar);
    parser = parser.add(initial);
    expect(parser.size).toBeGreaterThan(0);
  });

  test.each([
    [null,],
    [undefined,],
    [
      {
        "$schema": "https://json-schema.org/draft/2020-11/schema",
        type: 'string'
      }
    ],
  ])('it throws if given invalid input %s', input => {
    expect(() => JSON2GBNF(input)).toThrow();

  });

  const failureTestCases: [
    TopLevelJSONSchema,
    string,
    number,
  ][] = [
      [
        false,
        '1',
        0,
      ],
      [{ type: 'string' }, '42', 0],
      [{ type: 'number' }, '"42"', 0],
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
    ];
  test.each(failureTestCases)('it parses a schema %s to grammar and rejects %s', (schema, initial, errorPos) => {
    const grammar = JSON2GBNF(schema);
    let parser = GBNF(grammar);
    expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, errorPos));
  });
});
