import chai, { assert, expect } from 'chai'
import retry from 'bluebird-retry'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'

import preprocessor, { PreprocessorOptions } from '../../src'
import { createFixtureFile, FixtureFile } from '../fixtures'
import { chaiSnapshot } from '../helpers/match-snapshot'

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(chaiSnapshot)

describe('compilation - e2e', () => {
  let file: FixtureFile

  beforeEach(async () => {
    await FixtureFile.reset()
  })

  afterEach(() => {
    file.close()
  })

  describe('test preprocessor output', () => {
    it('correctly preprocesses the file', async () => {
      file = createFixtureFile({ shouldWatch: true })

      await runPreprocessor(file)

      await expect(file.getOutputFileContent()).to.eventually.matchSnapshot
    })

    it('correctly preprocesses the file using plugins', async () => {
      file = createFixtureFile({ name: 'success_spec.ts' })

      const options = {
        rollupOptions: {
          plugins: [
            require('rollup-plugin-typescript2')({
              tsconfigOverride: {
                compilerOptions: {
                  module: 'esnext',
                },
              },
            }),
          ],
        },
      }

      await runPreprocessor(file, options)

      await expect(file.getOutputFileContent()).to.eventually.matchSnapshot
    })

    it('correctly reprocesses the file after a modification', async () => {
      file = createFixtureFile({ shouldWatch: true })

      const emitSpy = spyOnEmitMethod(file)

      await runPreprocessor(file)

      await file.writeOnInputFile('console.log()')

      await listenForRerunEvent(emitSpy)

      await expect(file.getOutputFileContent()).to.eventually.matchSnapshot
    })

    it('correctly reprocesses the file after a modification, even if a syntax error is introduced', async () => {
      file = createFixtureFile({ shouldWatch: true })

      const emitSpy = spyOnEmitMethod(file)

      await runPreprocessor(file)
      await new Promise((res) => process.nextTick(res))
      await new Promise((res) => process.nextTick(res))
      await new Promise((res) => process.nextTick(res))

      await file.writeOnInputFile('{')

      await listenForRerunEvent(emitSpy)

      await expect(file.getOutputFileContent()).to.eventually.matchSnapshot
    })

    it('support watching the same file multiple times', async () => {
      file = createFixtureFile({ shouldWatch: true })

      const [firstOutput, secondOutput] = await Promise.all([
        runPreprocessor(file),
        runPreprocessor(file),
      ])

      expect(firstOutput).to.be.equal(secondOutput)
    })

    it('has less verbose "Module not found" error', async () => {
      file = createFixtureFile({ name: 'error_due_importing_nonexistent_file_spec.js' })

      await expect(runPreprocessor(file))
      .to.eventually.be.rejected
      .and.to.matchSnapshot
    })

    it('has less verbose "Syntax error"', async () => {
      file = createFixtureFile({ name: 'error_due_invalid_syntax_spec.js' })

      await expect(runPreprocessor(file))
      .to.eventually.be.rejected
      .and.to.matchSnapshot
    })
  })

  describe('test event emission', () => {
    it('triggers rerun after a modification', async () => {
      file = createFixtureFile({ shouldWatch: true })

      await runPreprocessor(file)

      const emitSpy = spyOnEmitMethod(file)

      await file.writeOnInputFile('console.log()')

      await listenForRerunEvent(emitSpy)
    })

    it('triggers rerun after a modification, even if a syntax error is introduced', async () => {
      file = createFixtureFile({ shouldWatch: true })

      await runPreprocessor(file)

      const emitSpy = spyOnEmitMethod(file)

      await file.writeOnInputFile('{')

      await listenForRerunEvent(emitSpy)
    })

    it('does not trigger rerun on initial build', async () => {
      file = createFixtureFile({ shouldWatch: true })

      await runPreprocessor(file)

      const emitSpy = spyOnEmitMethod(file)

      expect(emitSpy).not.to.be.calledWith('rerun')
    })

    it('triggers rerun on subsequent builds', async () => {
      file = createFixtureFile({ shouldWatch: true })

      const emitSpy = spyOnEmitMethod(file)

      await runPreprocessor(file)

      await file.writeOnInputFile('console.log()')

      await listenForRerunEvent(emitSpy)
    })

    it('does not trigger rerun on errored initial build', async () => {
      file = createFixtureFile({ name: 'error_due_invalid_syntax_spec.js', shouldWatch: true })

      const emitSpy = spyOnEmitMethod(file)

      try {
        await runPreprocessor(file)
        assert.fail()
      } catch {
        expect(emitSpy).not.to.be.calledWith('rerun')
      }
    })

    it('triggers rerun on subsequent builds, even after a errored initial build', async () => {
      file = createFixtureFile({ name: 'error_due_invalid_syntax_spec.js', shouldWatch: true })

      const emitSpy = spyOnEmitMethod(file)

      try {
        await runPreprocessor(file)
        assert.fail()
      } catch {
        await file.writeOnInputFile('console.log()')

        await listenForRerunEvent(emitSpy)
      }
    })
  })
})

async function runPreprocessor (file: FixtureFile, options: undefined | PreprocessorOptions = undefined): Promise<string> {
  const result = await preprocessor(options)(file)

  // MAC OS bug
  await awaitNextTick()

  return result
}

function spyOnEmitMethod (file: FixtureFile) {
  return sinon.spy(file, 'emit')
}

async function awaitNextTick (): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 100))
}

function listenForRerunEvent (emitSpy: sinon.SinonSpy<[string | symbol, ...any[]], boolean>) {
  return retry(() => expect(emitSpy).calledWith('rerun'), { max_tries: 20 })
}
