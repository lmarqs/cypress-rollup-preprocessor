/// <reference types="cypress" />

const rollupPreprocessor = require('cypress-rollup-preprocessor')

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on) => {
  on('file:preprocessor', rollupPreprocessor({
    inputOptions: require('../../rollup.config'),
  }))
}
