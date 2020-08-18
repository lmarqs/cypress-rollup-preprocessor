import { expect } from 'chai'
import preprocessor from '../../dist'

describe('typescript dist output', () => {
  it('builds dist correctly', () => {
    expect(preprocessor).to.be.a('function')
    expect(preprocessor).to.be.equal(require('../../dist'))
  })
})
