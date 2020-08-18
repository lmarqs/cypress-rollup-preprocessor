const rollupPreprocessor = require('../../../../dist').default

module.exports = (on) => {
  on('file:preprocessor', rollupPreprocessor())
}
