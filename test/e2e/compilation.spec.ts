import chai, { assert, expect } from 'chai'
import retry from 'bluebird-retry'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import snapshot from 'snap-shot-it'

import preprocessor, { PreprocessorOptions } from '../../src'
import { createFixtureFile, FixtureFile } from '../fixtures'

chai.use(sinonChai)

describe('compilation - e2e', () => {
  let file: FixtureFile

  beforeEach(async () => {
    await FixtureFile.reset()
  })

  afterEach(() => {
    file.close()
  })

  it('correctly preprocesses the file', async () => {
    file = createFixtureFile()

    await runPreprocessor(file)

    await assertCompilationOutput(file)
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

    await assertCompilationOutput(file)
  })

  it('correctly reprocesses the file after a modification', async () => {
    file = createFixtureFile({ shouldWatch: true })

    const emitSpy = spyOnEmitMethod(file)

    await runPreprocessor(file)

    await file.writeOnInputFile('console.log()')

    await awaitForRerunCall(emitSpy)

    await assertCompilationOutput(file)
  })

  it('support watching the same file multiple times', async () => {
    file = createFixtureFile({ shouldWatch: true })

    await runPreprocessor(file)

    const firstOutput = await file.getOutputFileContent()

    await runPreprocessor(file)

    const secondOutput = await file.getOutputFileContent()

    expect(secondOutput).to.be.equal(firstOutput)
  })

  it('has less verbose "Module not found" error', async () => {
    file = createFixtureFile({ name: 'error_due_importing_nonexistent_file_spec.js' })

    await assertCompilationFailure(runPreprocessor(file))
  })

  it('has less verbose syntax error', async () => {
    file = createFixtureFile({ name: 'error_due_invalid_syntax_spec.js' })

    await assertCompilationFailure(runPreprocessor(file))
  })

  it('triggers rerun on syntax error', async () => {
    file = createFixtureFile({ shouldWatch: true })

    await runPreprocessor(file)

    const emitSpy = spyOnEmitMethod(file)

    await file.writeOnInputFile('{')

    await awaitForRerunCall(emitSpy)

    await assertCompilationFailure(runPreprocessor(file))
  })

  it('does not call rerun on initial build, but on subsequent builds', async () => {
    file = createFixtureFile({ shouldWatch: true })

    await runPreprocessor(file)

    const emitSpy = spyOnEmitMethod(file)

    expect(emitSpy).not.to.be.calledWith('rerun')

    await file.writeOnInputFile('console.log()')

    await awaitForRerunCall(emitSpy)
  })

  it('does not call rerun on errored initial build, but on subsequent builds', async () => {
    file = createFixtureFile({ name: 'error_due_invalid_syntax_spec.js', shouldWatch: true })

    const emitSpy = spyOnEmitMethod(file)

    await assertCompilationFailure(runPreprocessor(file))

    expect(emitSpy).not.to.be.calledWith('rerun')

    await file.writeOnInputFile('console.log()')

    await awaitForRerunCall(emitSpy)
  })
})

function runPreprocessor (file: FixtureFile, options: PreprocessorOptions = {}): Promise<string> {
  return preprocessor(options)(file)
}

function spyOnEmitMethod (file: FixtureFile) {
  return sinon.spy(file, 'emit')
}

async function assertCompilationFailure (compilationPromise: any) {
  try {
    await compilationPromise
    assert.fail()
  } catch (e) {
    snapshot(normalizeErrorMessage(e.message))
  }
}

async function assertCompilationOutput (file: FixtureFile) {
  snapshot(await file.getOutputFileContent())
}

function normalizeErrorMessage (message: string) {
  return message.replace(/\/\S+\/_test/g, '<path>/_test')
}

function awaitForRerunCall (emitSpy: sinon.SinonSpy<[string | symbol, ...any[]], boolean>) {
  return retry(() => expect(emitSpy).calledWith('rerun'))
}
