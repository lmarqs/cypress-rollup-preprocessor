/// <reference types="cypress" />

const rollupPreprocessor = require('../../dist')

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on) => {
  on('file:preprocessor', rollupPreprocessor())
}
