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
        ({}, ["root ::= json2gbnf", "json2gbnf ::= val"]),
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
                """root ::= json2gbnf""",
                f"""xa ::= ({WHITESPACE_KEY})?""",
                f"""ws{COLON_KEY}ws ::= xa {COLON_KEY} xa""",
                f"""{LEFT_BRACE_KEY}ws ::= {LEFT_BRACE_KEY} xa""",
                f"""ws{RIGHT_BRACE_KEY} ::= xa {RIGHT_BRACE_KEY}""",
                f"""{COMMA_KEY}ws ::= {COMMA_KEY} xa""",
                f"""xb ::= {QUOTE_KEY} "number" {QUOTE_KEY} wscolws {NUMBER_KEY}""",
                f"""xc ::= {QUOTE_KEY} "street_name" {QUOTE_KEY} wscolws {STRING_KEY}""",
                f"""xd ::= {QUOTE_KEY} "Street" {QUOTE_KEY} | {QUOTE_KEY} "Avenue" {QUOTE_KEY} | {QUOTE_KEY} "Boulevard" {QUOTE_KEY}""",
                f"""xe ::= {QUOTE_KEY} "street_type" {QUOTE_KEY} ws{COLON_KEY}ws xd""",
                f"""xf ::= xb {COMMA_KEY}ws xc""",
                f"""xg ::= xb {COMMA_KEY}ws xc {COMMA_KEY}ws xe""",
                f"""xh ::= xb {COMMA_KEY}ws xe""",
                f"""xi ::= xb {COMMA_KEY}ws xe {COMMA_KEY}ws xc""",
                f"""xj ::= xc {COMMA_KEY}ws xb""",
                f"""xk ::= xc {COMMA_KEY}ws xb {COMMA_KEY}ws xe""",
                f"""xl ::= xc {COMMA_KEY}ws xe""",
                f"""xm ::= xc {COMMA_KEY}ws xe {COMMA_KEY}ws xb""",
                f"""xn ::= xe {COMMA_KEY}ws xb""",
                f"""xo ::= xe {COMMA_KEY}ws xb {COMMA_KEY}ws xc""",
                f"""xp ::= xe {COMMA_KEY}ws xc""",
                f"""xq ::= xe {COMMA_KEY}ws xc {COMMA_KEY}ws xb""",
                f"""json2gbnf ::= {LEFT_BRACE_KEY}ws (xb | xf | xg | xh | xi | xc | xj | xk | xl | xm | xe | xn | xo | xp | xq)? ws{RIGHT_BRACE_KEY}""",
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
        """root ::= json2gbnf""",
        f"""xa ::= {QUOTE_KEY} "number" {QUOTE_KEY} {COLON_KEY} {NUMBER_KEY}""",
        f"""xb ::= {QUOTE_KEY} "street_name" {QUOTE_KEY} {COLON_KEY} {STRING_KEY}""",
        f"""xc ::= {QUOTE_KEY} "Street" {QUOTE_KEY} | {QUOTE_KEY} "Avenue" {QUOTE_KEY} | {QUOTE_KEY} "Boulevard" {QUOTE_KEY}""",
        f"""xd ::= {QUOTE_KEY} "street_type" {QUOTE_KEY} {COLON_KEY} xc""",
        f"""json2gbnf ::= {LEFT_BRACE_KEY} (xa com xb com xd) {RIGHT_BRACE_KEY}""",
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
        """root ::= json2gbnf""",
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
        f"""json2gbnf ::= {LEFT_BRACE_KEY} (xa | xe | xf | xg | xh | xb | xi | xj | xk | xl | xd | xm | xn | xo | xp)? {RIGHT_BRACE_KEY}""",
    ]
    assert result.split("\n")[: len(expected)] == expected
