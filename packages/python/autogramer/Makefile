init:
	pip install -r requirements.txt

test:
	nosetests tests

copy_assets:
	cp ../../LICENSE ./ 

build_package:
	make copy_assets && python3 -m build
