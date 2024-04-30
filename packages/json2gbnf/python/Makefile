SHELL := /bin/bash

init:
	source .venv/dev/bin/activate && pip install -r requirements.txt

test:
	source .venv/dev/bin/activate && make copy_js_package && pytest .

lint:
	source .venv/dev/bin/activate && ruff check . --fix

copy_assets:
	cp ../../../LICENSE ./ 

build:
	make copy_assets && make build_package

build_package:
	source .venv/dev/bin/activate && make copy_js_package && python3 -m build

copy_js_package:
	rm -rf json2gbnf/js && mkdir -p json2gbnf/js && cd ../javascript/ && pnpm build && cp -R dist/. ../python/json2gbnf/js
