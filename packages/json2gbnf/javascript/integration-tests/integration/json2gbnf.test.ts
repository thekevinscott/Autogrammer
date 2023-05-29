import {
  describe,
  expect,
  test,
} from 'vitest';
import {
  GLOBAL_CONSTANTS,
} from "../../src/constants/constants.js";
import JSON2GBNF from "json2gbnf";
import GBNF, {
  InputParseError,
} from 'gbnf';
import {
  GLOBAL_CONSTANTS as GBNF_GLOBAL_CONSTANTS,
} from 'gbnf/builder';
import type {
  TopLevelJSONSchema
} from "../../src/types.js";
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
import {
  OBJECT_KEY_DEF
} from "../../src/utils/get-property-definition.js";

const OBJECT_GRAMMAR = [`jsontogbnf ::= ${OBJECT_KEY}`,];
const STREET_SCHEMA = {
  type: 'object',
  additionalProperties: false,
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
  `jsontogbnf ::= ${LEFT_BRACE_KEY} (xa | xe | xf | xg | xh | xb | xi | xj | xk | xl | xd | xm | xn | xo | xp)? ${RIGHT_BRACE_KEY}`,
];

describe('schema', () => {
  const successTestCases: [
    TopLevelJSONSchema,
    any,
    string[],
  ][] = [
      [{}, '42', [`jsontogbnf ::= ${VALUE_KEY}`],],
      [{}, '"42"', [`jsontogbnf ::= ${VALUE_KEY}`],],
      [{}, '"string town"', [`jsontogbnf ::= ${VALUE_KEY}`],],
      [{}, JSON.stringify({ "an": ["arbitrary", "object"], data: "foo" }), [`jsontogbnf ::= ${VALUE_KEY}`],],
      [true, '42', [`jsontogbnf ::= ${VALUE_KEY}`],],
      [{ type: 'string' }, '"foo"', [`jsontogbnf ::= ${STRING_KEY}`,],],
      [{
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        type: 'string'
      }, '"foo"', [`jsontogbnf ::= ${STRING_KEY}`,],],
      [{ type: 'number' }, "123", [`jsontogbnf ::= ${NUMBER_KEY}`,],],
      [{ type: 'number' }, '-123.001', [`jsontogbnf ::= ${NUMBER_KEY}`,],],
      [{ type: 'boolean' }, 'true', [`jsontogbnf ::= ${BOOLEAN_KEY}`,],],
      [{ type: 'null' }, 'null', [`jsontogbnf ::= ${NULL_KEY}`,],],
      [{ type: 'string', minLength: 2 }, '"fo"', [`jsontogbnf ::= ${QUOTE_KEY} ${CHAR_KEY} (${CHAR_KEY})+ ${QUOTE_KEY}`],],
      [{ type: 'string', minLength: 2 }, '"foo"', [`jsontogbnf ::= ${QUOTE_KEY} ${CHAR_KEY} (${CHAR_KEY})+ ${QUOTE_KEY}`],],
      [{ type: 'string', maxLength: 3 }, '"foo"', [`jsontogbnf ::= ${QUOTE_KEY} (${CHAR_KEY})? (${CHAR_KEY})? (${CHAR_KEY})? ${QUOTE_KEY}`],],
      [{ type: 'string', minLength: 2, maxLength: 3 }, '"fo"', [`jsontogbnf ::= ${QUOTE_KEY} ${CHAR_KEY} ${CHAR_KEY} (${CHAR_KEY})? ${QUOTE_KEY}`],],
      [{ type: 'string', minLength: 2, maxLength: 3 }, '"foo"', [`jsontogbnf ::= ${QUOTE_KEY} ${CHAR_KEY} ${CHAR_KEY} (${CHAR_KEY})? ${QUOTE_KEY}`],],
      // top-level const
      [{ type: 'string', const: "foo" }, '"foo"', [`jsontogbnf ::= ${QUOTE_KEY} "foo" ${QUOTE_KEY}`],],
      [{ type: 'integer' }, "123", [`jsontogbnf ::= ${INTEGER_KEY}`,],],
      [{ type: 'integer' }, "123.0", [`jsontogbnf ::= ${INTEGER_KEY}`,],],
      [{ enum: ['red', null, 42] }, `"red"`, [`jsontogbnf ::= "\\"red\\"" | ${NULL_KEY} | "42"`,],],
      [{ enum: ['red', null, 42] }, `null`, [`jsontogbnf ::= "\\"red\\"" | ${NULL_KEY} | "42"`,],],
      [{ enum: ['red', null, 42] }, `42`, [`jsontogbnf ::= "\\"red\\"" | ${NULL_KEY} | "42"`,],],
      [{ enum: ['red', null, 42] }, `42`, [`jsontogbnf ::= "\\"red\\"" | ${NULL_KEY} | "42"`,],],
      [{ type: ['string'] }, '"foo"', [`jsontogbnf ::= ${STRING_KEY}`,],],
      [
        { type: ['string', 'number'] },
        '"foo"',
        [
          `jsontogbnf ::= ${STRING_KEY} | ${NUMBER_KEY}`,
        ]],
      [
        { type: ['string', 'number', 'boolean', 'null'] },
        '"foo"',
        [
          `jsontogbnf ::= ${STRING_KEY} | ${NUMBER_KEY} | ${BOOLEAN_KEY} | ${NULL_KEY}`,
        ],
      ],
      [
        { type: ['string', 'number', 'boolean', 'null', 'array', 'object'] },
        '"foo"',
        [
          `jsontogbnf ::= ${STRING_KEY} | ${NUMBER_KEY} | ${BOOLEAN_KEY} | ${NULL_KEY} | ${ARRAY_KEY} | ${OBJECT_KEY}`,
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
          `jsontogbnf ::= ${LEFT_BRACE_KEY} (xe | xf | xg | xh | xi | xj | xk | xl) ${RIGHT_BRACE_KEY}`,
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
          `jsontogbnf ::= ${LEFT_BRACE_KEY} (xe | xf | xg | xh | xi | xj | xk | xl) ${RIGHT_BRACE_KEY}`,
        ],
      ],
      // additionalProperties being true
      [
        {
          ...STREET_SCHEMA,
          additionalProperties: true,
        },
        JSON.stringify({ "number": 1600, "street_name": "Foo", "street_type": "Boulevard" }),
        [
          `xa ::= (${COMMA_KEY} ${QUOTE_KEY} ${OBJECT_KEY_DEF} ${QUOTE_KEY} ${COLON_KEY} ${VALUE_KEY} (${COMMA_KEY} ${QUOTE_KEY} ${OBJECT_KEY_DEF} ${QUOTE_KEY} ${COLON_KEY} ${VALUE_KEY})*)?`,
          `xb ::= ${QUOTE_KEY} "number" ${QUOTE_KEY} ${COLON_KEY} ${NUMBER_KEY}`,
          `xc ::= ${QUOTE_KEY} "street_name" ${QUOTE_KEY} ${COLON_KEY} ${STRING_KEY}`,
          `xd ::= ${QUOTE_KEY} "Street" ${QUOTE_KEY} | ${QUOTE_KEY} "Avenue" ${QUOTE_KEY} | ${QUOTE_KEY} "Boulevard" ${QUOTE_KEY}`,
          `xe ::= ${QUOTE_KEY} "street_type" ${QUOTE_KEY} ${COLON_KEY} xd`,
          `xf ::= xb xa ${COMMA_KEY} xc xa`,
          `xg ::= xb xa ${COMMA_KEY} xc xa ${COMMA_KEY} xe xa`,
          `xh ::= xb xa ${COMMA_KEY} xe xa`,
          `xi ::= xb xa ${COMMA_KEY} xe xa ${COMMA_KEY} xc xa`,
          `xj ::= xc xa ${COMMA_KEY} xb xa`,
          `xk ::= xc xa ${COMMA_KEY} xb xa ${COMMA_KEY} xe xa`,
          `xl ::= xc xa ${COMMA_KEY} xe xa`,
          `xm ::= xc xa ${COMMA_KEY} xe xa ${COMMA_KEY} xb xa`,
          `xn ::= xe xa ${COMMA_KEY} xb xa`,
          `xo ::= xe xa ${COMMA_KEY} xb xa ${COMMA_KEY} xc xa`,
          `xp ::= xe xa ${COMMA_KEY} xc xa`,
          `xq ::= xe xa ${COMMA_KEY} xc xa ${COMMA_KEY} xb xa`,
          `jsontogbnf ::= ${LEFT_BRACE_KEY} (xb xa | xf | xg | xh | xi | xc xa | xj | xk | xl | xm | xe xa | xn | xo | xp | xq)? ${RIGHT_BRACE_KEY}`,
        ],
      ],
      // additionalProperties being true and requirements being true
      [
        {
          ...STREET_SCHEMA,
          additionalProperties: true,
          required: ['number', 'street_type'],
        },
        JSON.stringify({ "number": 1600, "street_name": "Foo", "street_type": "Boulevard" }),
        [
          `xa ::= (${COMMA_KEY} ${QUOTE_KEY} ${OBJECT_KEY_DEF} ${QUOTE_KEY} ${COLON_KEY} ${VALUE_KEY} (${COMMA_KEY} ${QUOTE_KEY} ${OBJECT_KEY_DEF} ${QUOTE_KEY} ${COLON_KEY} ${VALUE_KEY})*)?`,
          `xb ::= ${QUOTE_KEY} "number" ${QUOTE_KEY} ${COLON_KEY} ${NUMBER_KEY}`,
          `xc ::= ${QUOTE_KEY} "street_name" ${QUOTE_KEY} ${COLON_KEY} ${STRING_KEY}`,
          `xd ::= ${QUOTE_KEY} "Street" ${QUOTE_KEY} | ${QUOTE_KEY} "Avenue" ${QUOTE_KEY} | ${QUOTE_KEY} "Boulevard" ${QUOTE_KEY}`,
          `xe ::= ${QUOTE_KEY} "street_type" ${QUOTE_KEY} ${COLON_KEY} xd`,
          `xf ::= xb xa ${COMMA_KEY} xc xa ${COMMA_KEY} xe xa`,
          `xg ::= xb xa ${COMMA_KEY} xe xa`,
          `xh ::= xb xa ${COMMA_KEY} xe xa ${COMMA_KEY} xc xa`,
          `xi ::= xc xa ${COMMA_KEY} xb xa ${COMMA_KEY} xe xa`,
          `xj ::= xc xa ${COMMA_KEY} xe xa ${COMMA_KEY} xb xa`,
          `xk ::= xe xa ${COMMA_KEY} xb xa`,
          `xl ::= xe xa ${COMMA_KEY} xb xa ${COMMA_KEY} xc xa`,
          `xm ::= xe xa ${COMMA_KEY} xc xa ${COMMA_KEY} xb xa`,
          `jsontogbnf ::= ${LEFT_BRACE_KEY} (xf | xg | xh | xi | xj | xk | xl | xm) ${RIGHT_BRACE_KEY}`,
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
          `jsontogbnf ::= ${LEFT_BRACE_KEY} (xa | xc | xb | xd)? ${RIGHT_BRACE_KEY}`,
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
          `jsontogbnf ::= ${LEFT_BRACE_KEY} (xa | xc | xb | xd)? ${RIGHT_BRACE_KEY}`,
        ],
      ],
      [{ type: 'array' }, JSON.stringify([1, 'a', {}]), [`jsontogbnf ::= ${ARRAY_KEY}`,],],
      [
        { type: 'array', items: { type: 'number' } },
        JSON.stringify([1, 2, 3]),
        [
          `jsontogbnf ::= ${LEFT_BRACKET_KEY} (${NUMBER_KEY} (${COMMA_KEY} ${NUMBER_KEY})*)? ${RIGHT_BRACKET_KEY}`,
        ],
      ],
      [
        { type: 'array', items: { type: 'number' } },
        JSON.stringify([]),
        [
          `jsontogbnf ::= ${LEFT_BRACKET_KEY} (${NUMBER_KEY} (${COMMA_KEY} ${NUMBER_KEY})*)? ${RIGHT_BRACKET_KEY}`,
        ],
      ],
      [
        { type: 'array', items: { type: ['number', 'string'] } },
        JSON.stringify([1, "foo", 3]),
        [
          `xa ::= ${NUMBER_KEY} | ${STRING_KEY}`,
          `jsontogbnf ::= ${LEFT_BRACKET_KEY} (xa (${COMMA_KEY} xa)*)? ${RIGHT_BRACKET_KEY}`,
        ],
      ],
    ];
  test.each(successTestCases)('it parses a schema %s to grammar with %s', (schema, initial, expected) => {
    const grammar = JSON2GBNF(schema, {
      whitespace: 0,
    });
    expect(grammar).toEqual([
      `root ::= jsontogbnf`,
      ...expected,
      ...GBNF_GLOBAL_CONSTANTS,
      ...GLOBAL_CONSTANTS,
    ].join('\n'));
    let parser = GBNF(grammar);
    parser = parser.add(initial);
    expect(parser.size).toBeGreaterThan(0);
  });

  test.each([
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
      [
        {
          "type": "object",
          "properties": {
            "number": {
              "type": "number"
            },
            "street_name": {
              "type": "string"
            },
            "street_type": {
              "enum": [
                "Street",
                "Avenue",
                "Boulevard"
              ]
            }
          },
          "required": [
            "number",
            "street_name",
            "street_type"
          ]
        },
        `{"number":16,"street_name":"Pennsylvania Avenue","street_type":"Avenue","zip":"20500"}\\nJSON is case sensisive, please ensure all field names are in camelCase.`,
        86,

      ],
    ];
  test.each(failureTestCases)('it parses a schema %s to grammar and rejects %s', (schema, _initial, errorPos) => {
    const grammar = JSON2GBNF(schema);
    let parser = GBNF(grammar);
    const initial = _initial.split('\\n').join('\n');
    expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, errorPos));
  });
});
