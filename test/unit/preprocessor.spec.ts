import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'

import { preprocessor } from '../../src/preprocessor'

chai.use(chaiAsPromised)

describe('preprocessor', () => {
  it('build files correctly', async () => {
    const file = {
      filePath: '',
      outputPath: '',
      shouldWatch: false,
    }

    return expect(preprocessor(file)).to.be.rejected
  })
})
