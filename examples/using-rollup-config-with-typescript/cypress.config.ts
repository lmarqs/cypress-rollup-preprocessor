import { defineConfig } from 'cypress'
import rollupPreprocessor from 'cypress-rollup-preprocessor'
import rollupConfig from '../../rollup.config'

const { output: outputOptions, ...inputOptions } = rollupConfig

export default defineConfig({
  fixturesFolder: false,
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    supportFile: false,
    setupNodeEvents (on, config) {
      on('file:preprocessor', rollupPreprocessor({ inputOptions, outputOptions }))
    },
  },
})
