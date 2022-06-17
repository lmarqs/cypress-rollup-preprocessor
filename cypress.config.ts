import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    supportFile: false,
  },
})
