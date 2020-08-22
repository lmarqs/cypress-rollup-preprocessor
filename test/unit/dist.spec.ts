import { expect } from 'chai'

// ensure types are exported
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import preprocessor, { FileObject, PreprocessorOptions } from '../../dist'

describe('typescript dist output', () => {
  it('builds dist correctly', () => {
    expect(preprocessor).to.be.a('function')
  })

  it('exports function compatible with CommonsJS', () => {
    expect(require('../../dist')).to.be.equal(preprocessor)
  })
})
