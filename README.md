# cypress-rollup-preprocessor

![Build](https://github.com/lmarqs/cypress-rollup-preprocessor/workflows/Build/badge.svg?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/7b0c1699b09bf771af2b/maintainability)](https://codeclimate.com/github/lmarqs/cypress-rollup-preprocessor/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7b0c1699b09bf771af2b/test_coverage)](https://codeclimate.com/github/lmarqs/cypress-rollup-preprocessor/test_coverage)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Cypress preprocessor for bundling JavaScript via rollup

## Installation

First install [node.js](http://nodejs.org/). Then:

```sh
npm install cypress-rollup-preprocessor --save-dev
```

This package relies on the following [peer dependencies](https://docs.npmjs.com/files/package.json#peerdependencies):

- rollup

It is likely you already have these installed either directly or as a transient
dependency, but if not, you will need to install them.

```sh
npm install --save-dev rollup
```

## Compatibility

This version is only compatible with rollup 2.x+

## Usage

In your project's [plugins file](https://on.cypress.io/guides/tooling/plugins-guide.html):

```javascript
const rollupPreprocessor = require("cypress-rollup-preprocessor");

module.exports = (on) => {
  on("file:preprocessor", rollupPreprocessor());
};
```

### Examples

- [Basic](https://github.com/lmarqs/cypress-rollup-preprocessor/tree/master/examples/basic)
- [Using Typescript](https://github.com/lmarqs/cypress-rollup-preprocessor/tree/master/examples/typescript)

## Options

Pass in options as the argument to `rollup`:

```javascript
const rollupPreprocessor = require("cypress-rollup-preprocessor");

module.exports = (on) => {
  const options = {
    // send in the options from your rollup.config.js, so it works the same
    // as your app's code
    rollupOptions: require("../../rollup.config"),
  };

  on("file:preprocessor", rollupPreprocessor(options));
};
```

### rollupOptions

Object of rollup options. Just `require` in the options from your
`rollup.config.js` to use the same options as your app.

## Contributing

Please read the [Contributing guidelines](CONTRIBUTING.md).

### Running Tests

To run tests, first install nodeunit and any dependencies via npm:

```sh
npm ci
```

Run tests with:

```sh
npm test
```

## Inspiration

Many approaches, patterns and standards were copied from:

- <https://github.com/cypress-io/cypress-webpack-preprocessor>
- <https://github.com/cypress-io/cypress-watch-preprocessor>

## Alternatives

- <https://github.com/bahmutov/cy-rollup>

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
