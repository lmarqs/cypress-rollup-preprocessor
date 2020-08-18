const rollupPreprocessor = require('../../../../dist')

module.exports = (on) => {
  on('file:preprocessor', rollupPreprocessor())
}
