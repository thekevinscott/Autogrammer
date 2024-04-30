import pytest
from .json2gbnf import json2gbnf

VALUE_KEY = "val"
OBJECT_KEY = "obj"
ARRAY_KEY = "arr"
STRING_KEY = "str"
NUMBER_KEY = "num"
BOOLEAN_KEY = "bol"
NULL_KEY = "nll"
CHAR_KEY = "chr"
INTEGER_KEY = "int"
COMMA_KEY = "com"
COLON_KEY = "col"
QUOTE_KEY = "qot"
LEFT_BRACKET_KEY = "lbkt"
RIGHT_BRACKET_KEY = "rbkt"
LEFT_BRACE_KEY = "lbrc"
RIGHT_BRACE_KEY = "rbrc"
WHITESPACE_KEY = "ws"
WHITESPACE_REPEATING_KEY = "wss"


@pytest.mark.parametrize(
    ("schema", "expected"),
    [
        ({}, ["root ::= val"]),
        (
            {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "number": {"type": "number"},
                    "street_name": {"type": "string"},
                    "street_type": {"enum": ["Street", "Avenue", "Boulevard"]},
                },
            },
            [
                f"""xa ::= ({WHITESPACE_KEY})?""",
                f"""ws{COLON_KEY}ws ::= xa {COLON_KEY} xa""",
                f"""{LEFT_BRACE_KEY}ws ::= {LEFT_BRACE_KEY} xa""",
                f"""ws{RIGHT_BRACE_KEY} ::= xa {RIGHT_BRACE_KEY}""",
                f"""{COMMA_KEY}ws ::= {COMMA_KEY} xa""",
                f"""xf ::= {QUOTE_KEY} "number" {QUOTE_KEY} wscolws {NUMBER_KEY}""",
                f"""xg ::= {QUOTE_KEY} "street_name" {QUOTE_KEY} wscolws {STRING_KEY}""",
                f"""xh ::= {QUOTE_KEY} "Street" {QUOTE_KEY} | {QUOTE_KEY} "Avenue" {QUOTE_KEY} | {QUOTE_KEY} "Boulevard" {QUOTE_KEY}""",
                f"""xi ::= {QUOTE_KEY} "street_type" {QUOTE_KEY} ws{COLON_KEY}ws xh""",
                f"""xj ::= xf {COMMA_KEY}ws xg""",
                f"""xk ::= xf {COMMA_KEY}ws xg {COMMA_KEY}ws xi""",
                f"""xl ::= xf {COMMA_KEY}ws xi""",
                f"""xm ::= xf {COMMA_KEY}ws xi {COMMA_KEY}ws xg""",
                f"""xn ::= xg {COMMA_KEY}ws xf""",
                f"""xo ::= xg {COMMA_KEY}ws xf {COMMA_KEY}ws xi""",
                f"""xp ::= xg {COMMA_KEY}ws xi""",
                f"""xq ::= xg {COMMA_KEY}ws xi {COMMA_KEY}ws xf""",
                f"""xr ::= xi {COMMA_KEY}ws xf""",
                f"""xs ::= xi {COMMA_KEY}ws xf {COMMA_KEY}ws xg""",
                f"""xt ::= xi {COMMA_KEY}ws xg""",
                f"""xu ::= xi {COMMA_KEY}ws xg {COMMA_KEY}ws xf""",
                f"""root ::= {LEFT_BRACE_KEY}ws (xf | xj | xk | xl | xm | xg | xn | xo | xp | xq | xi | xr | xs | xt | xu)? ws{RIGHT_BRACE_KEY}""",
            ],
        ),
    ],
)
def test_it_calls_json2gbnf(schema, expected):
    result = json2gbnf(schema)
    assert result.split("\n")[: len(expected)] == expected


def test_it_calls_json2gbnf_with_fixed_order():
    schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "number": {"type": "number"},
            "street_name": {"type": "string"},
            "street_type": {"enum": ["Street", "Avenue", "Boulevard"]},
        },
    }

    result = json2gbnf(schema, fixed_order=True, whitespace=0)
    expected = [
        f"""xa ::= {QUOTE_KEY} "number" {QUOTE_KEY} {COLON_KEY} {NUMBER_KEY}""",
        f"""xb ::= {QUOTE_KEY} "street_name" {QUOTE_KEY} {COLON_KEY} {STRING_KEY}""",
        f"""xc ::= {QUOTE_KEY} "Street" {QUOTE_KEY} | {QUOTE_KEY} "Avenue" {QUOTE_KEY} | {QUOTE_KEY} "Boulevard" {QUOTE_KEY}""",
        f"""xd ::= {QUOTE_KEY} "street_type" {QUOTE_KEY} {COLON_KEY} xc""",
        f"""root ::= {LEFT_BRACE_KEY} (xa com xb com xd) {RIGHT_BRACE_KEY}""",
    ]
    assert result.split("\n")[: len(expected)] == expected


def test_it_calls_json2gbnf_without_whitespace():
    schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "number": {"type": "number"},
            "street_name": {"type": "string"},
            "street_type": {"enum": ["Street", "Avenue", "Boulevard"]},
        },
    }

    result = json2gbnf(schema, whitespace=0)
    expected = [
        f"""xa ::= {QUOTE_KEY} "number" {QUOTE_KEY} {COLON_KEY} {NUMBER_KEY}""",
        f"""xb ::= {QUOTE_KEY} "street_name" {QUOTE_KEY} {COLON_KEY} {STRING_KEY}""",
        f"""xc ::= {QUOTE_KEY} "Street" {QUOTE_KEY} | {QUOTE_KEY} "Avenue" {QUOTE_KEY} | {QUOTE_KEY} "Boulevard" {QUOTE_KEY}""",
        f"""xd ::= {QUOTE_KEY} "street_type" {QUOTE_KEY} {COLON_KEY} xc""",
        f"""xe ::= xa {COMMA_KEY} xb""",
        f"""xf ::= xa {COMMA_KEY} xb {COMMA_KEY} xd""",
        f"""xg ::= xa {COMMA_KEY} xd""",
        f"""xh ::= xa {COMMA_KEY} xd {COMMA_KEY} xb""",
        f"""xi ::= xb {COMMA_KEY} xa""",
        f"""xj ::= xb {COMMA_KEY} xa {COMMA_KEY} xd""",
        f"""xk ::= xb {COMMA_KEY} xd""",
        f"""xl ::= xb {COMMA_KEY} xd {COMMA_KEY} xa""",
        f"""xm ::= xd {COMMA_KEY} xa""",
        f"""xn ::= xd {COMMA_KEY} xa {COMMA_KEY} xb""",
        f"""xo ::= xd {COMMA_KEY} xb""",
        f"""xp ::= xd {COMMA_KEY} xb {COMMA_KEY} xa""",
        f"""root ::= {LEFT_BRACE_KEY} (xa | xe | xf | xg | xh | xb | xi | xj | xk | xl | xd | xm | xn | xo | xp)? {RIGHT_BRACE_KEY}""",
    ]
    assert result.split("\n")[: len(expected)] == expected
