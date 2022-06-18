import * as Chai from 'chai'
import snapshot from 'snap-shot-it'

export const chaiSnapshot: Chai.ChaiPlugin = (chai, utils) => {
  chai.Assertion.addProperty('matchSnapshot', async function () {
    try {
      const value = await Promise.resolve(this._obj)
      .catch((e: Error) => e.message)

      snapshot(normalizeStdOut(value))

      this.assert(true, 'expected to match snapshot', 'expected not to match snapshot', '')
    } catch (e) {
      this.assert(false, 'expected to match snapshot', 'expected not to match snapshot', '')
    }
  })
}

function normalizeStdOut (output: string): string {
  return output
  .replace(/\\/g, '/')
  .replace(/\r/g, '')
  .replace(process.cwd().replace(/\\/ug, '/'), '')
}

declare global {
  export namespace Chai {
    interface PromisedAssertion {
      matchSnapshot: PromisedAssertion
    }
  }
}
