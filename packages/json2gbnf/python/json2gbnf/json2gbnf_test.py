@pytest.mark.parametrize(
    ("schema"),
    [
        ({}),
    ],
)
def test_it_calls_json2gbnf(schema):
    result = json2gbnf(schema)
