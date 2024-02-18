VERSION=$(shell git describe --tag)

.PHONY: all
all: release/$(VERSION)-mv2.zip release/$(VERSION)-mv3.zip

release/$(VERSION)-mv2.zip: manifest.v2.json main.js background.js get-option.js main.css icon128.png
release/$(VERSION)-mv3.zip: manifest.v3.json main.js background.js get-option.js main.css icon128.png

%.zip:
	mkdir -p release/
	jq '.version="$(VERSION:v%=%)"' $< >manifest.json
	zip -r $@ manifest.json $^ --exclude $<
