import { defineConfig } from 'cypress'

import rollupPreprocessor from './dist'

export default defineConfig({
  fixturesFolder: false,
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    supportFile: false,
    setupNodeEvents (on, config) {
      on('file:preprocessor', rollupPreprocessor())
    },
  },
})
