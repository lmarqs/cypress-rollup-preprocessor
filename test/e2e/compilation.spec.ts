import chai, { assert, expect } from 'chai'
import retry from 'bluebird-retry'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'
import forEach from 'mocha-each'

import preprocessor, { PreprocessorOptions } from '../../src'
import { createFixtureFile, FixtureFile } from '../fixtures'
import { chaiSnapshot } from '../helpers/match-snapshot'

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(chaiSnapshot)

describe('compilation - e2e', function () {
  let file: FixtureFile

  beforeEach(async function () {
    await FixtureFile.reset()
  })

  afterEach(function () {
    file.close()
  })

  describe('test preprocessor output', function () {
    it('correctly preprocesses the file', async function () {
      file = await createFixtureFileAndRunPreprocessor()

      await expect(file.getOutputFileContent()).to.eventually.matchSnapshot
    })

    it('correctly preprocesses the file using plugins', async function () {
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

    forEach([
      ['syntax error'],
      ['console.log("valid modification")'],
    ])
    .it('correctly reprocesses the file after a modification (%s)', async (modification) => {
      file = await createFixtureFileAndRunPreprocessor({ shouldWatch: true })

      await file.writeOnInputFile(modification)

      await listenForRerunEvent(file)

      await expect(file.getOutputFileContent()).to.eventually.matchSnapshot
    })

    it('support watching the same file multiple times parallelly', async function () {
      file = createFixtureFile({ shouldWatch: true })

      const [firstOutput, secondOutput] = await Promise.all([
        runPreprocessor(file),
        runPreprocessor(file),
      ])

      expect(firstOutput).to.be.equal(secondOutput)
    })

    it('support watching the same file multiple times sequencialy', async function () {
      file = createFixtureFile({ shouldWatch: true })

      await runPreprocessor(file)
      const firstOutput = await file.getOutputFileContent()

      await runPreprocessor(file)
      const secondOutput = await file.getOutputFileContent()

      expect(firstOutput).to.be.equal(secondOutput)
    })

    forEach([
      'error_due_importing_nonexistent_file_spec.js',
      'error_due_invalid_syntax_spec.js',
    ])
    .it('has less verbose error message (%s)', async (name) => {
      file = createFixtureFile({ name })

      await expect(runPreprocessor(file))
      .to.eventually.be.rejected
      .and.to.matchSnapshot
    })
  })

  describe('test event emission', function () {
    forEach([
      'this is a syntax error',
      'console.log("this is a valid modification")',
    ])
    .it('triggers rerun after a modification (%s)', async () => {
      file = await createFixtureFileAndRunPreprocessor({ shouldWatch: true })

      await file.writeOnInputFile('console.log()')

      await listenForRerunEvent(file)
    })

    it('does not trigger rerun on initial build', async function () {
      file = await createFixtureFileAndRunPreprocessor({ shouldWatch: true })
      expect(file.emit).not.to.be.calledWith('rerun')
    })

    it('does not trigger rerun on errored initial build', async function () {
      file = createFixtureFile({ name: 'error_due_invalid_syntax_spec.js', shouldWatch: true })

      spyOnEmitMethod(file)

      try {
        await runPreprocessor(file)
        assert.fail()
      } catch {
        expect(file.emit).not.to.be.calledWith('rerun')
      }
    })

    it('triggers rerun on subsequent builds, even after a errored initial build', async function () {
      file = createFixtureFile({ name: 'error_due_invalid_syntax_spec.js', shouldWatch: true })

      spyOnEmitMethod(file)

      try {
        await runPreprocessor(file)
        assert.fail()
      } catch {
        await file.writeOnInputFile('console.log()')

        await listenForRerunEvent(file)
      }
    })
  })
})

async function createFixtureFileAndRunPreprocessor (createFileOpts?: Parameters<typeof createFixtureFile>[0], preprocessorOpts?: PreprocessorOptions): Promise<FixtureFile> {
  const file = createFixtureFile(createFileOpts)

  spyOnEmitMethod(file)
  await runPreprocessor(file, preprocessorOpts)

  return file
}

async function runPreprocessor (file: FixtureFile, options?: PreprocessorOptions): Promise<string> {
  const result = await preprocessor(options)(file)

  // MAC OS bug
  if (file.shouldWatch) {
    await new Promise<void>((resolve) => setTimeout(resolve, 100))
  }

  return result
}

function spyOnEmitMethod (file: FixtureFile) {
  return sinon.spy(file, 'emit')
}

function listenForRerunEvent (file: FixtureFile) {
  return retry(() => expect(file.emit).calledWith('rerun'), { max_tries: 20 })
}
