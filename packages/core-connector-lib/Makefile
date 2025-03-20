PACKAGE_NAME := $(shell node -p "require('./package.json').name")
PACKAGE_VERSION := $(shell node -p "require('./package.json').version")
TARBALL := $(PACKAGE_NAME)-$(PACKAGE_VERSION).tgz
DIST_DIR := dist

.PHONY: install build pack clean

install:
	npm install

build:
	rm -rf $(DIST_DIR)
	npm run build

pack: build
	mkdir -p $(DIST_DIR)
	npm pack
	mv $(TARBALL) $(DIST_DIR)/

clean:
	rm -rf node_modules package-lock.json $(DIST_DIR)
