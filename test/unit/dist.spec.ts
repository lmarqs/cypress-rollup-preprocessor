import { expect } from 'chai'

// ensure types are exported
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import preprocessor, { FileObject, PreprocessorOptions } from '../../dist'

describe('typescript dist output', function () {
  it('builds dist correctly', function () {
    expect(preprocessor).to.be.a('function')
  })

  it('exports function compatible with CommonsJS', function () {
    expect(require('../../dist')).to.be.equal(preprocessor)
  })
})
