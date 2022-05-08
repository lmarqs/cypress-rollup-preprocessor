import * as Chai from 'chai'
import snapshot from 'snap-shot-it'

export const chaiSnapshot: Chai.ChaiPlugin = (chai, utils) => {
  chai.Assertion.addProperty('matchSnapshot', async function () {
    try {
      const value = await Promise.resolve(this._obj)
      .catch((e: Error) => e.message)

      snapshot(value)
      this.assert(true, 'expected to match snapshot', 'expected not to match snapshot', '')
    } catch (e) {
      this.assert(false, 'expected to match snapshot', 'expected not to match snapshot', e.message)
    }
  })
}

declare global {
  export namespace Chai {
    interface PromisedAssertion {
        matchSnapshot: PromisedAssertion
    }
  }
}
