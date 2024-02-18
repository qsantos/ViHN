VERSION=$(shell git describe --tag)
SRC=main.js background.js get-option.js main.css options.html options.js icon128.png

.PHONY: all
all: release/$(VERSION)-mv2.zip release/$(VERSION)-mv3.zip

release/$(VERSION)-mv2.zip: manifest.v2.json $(SRC)
release/$(VERSION)-mv3.zip: manifest.v3.json $(SRC)

%.zip:
	mkdir -p release/
	jq '.version="$(VERSION:v%=%)"' $< >manifest.json
	zip -r $@ manifest.json $^ --exclude $<
