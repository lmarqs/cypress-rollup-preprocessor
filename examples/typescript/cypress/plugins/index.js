const rollupPreprocessor = require('cypress-rollup-preprocessor')

module.exports = (on) => {
  on('file:preprocessor', rollupPreprocessor({
    rollupOptions: require('../../rollup.config'),
  }))
}
