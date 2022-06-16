/// <reference types="cypress" />

const rollupPreprocessor = require('cypress-rollup-preprocessor')

// Using the options from rollup.config.js
const rollupConfig = require('../../rollup.config')

const { output: outputOptions, ...inputOptions } = rollupConfig

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on) => {
  const options = {
    inputOptions,
    outputOptions,
  }

  on('file:preprocessor', rollupPreprocessor(options))
}
