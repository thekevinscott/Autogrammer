import pythonmonkey as pm

sql2gbnfjs = pm.require("./js/index.umd.cjs")["default"]


def sql2gbnf(
    schema: dict, fixed_order: None | bool = None, whitespace: None | int = None
) -> str:
    return sql2gbnfjs(schema, {"fixedOrder": fixed_order, "whitespace": whitespace})
