import chai, { expect } from 'chai'
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

  it('correctly preprocesses the file', async () => {
    file = createFixtureFile()

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

    await awaitForRerunCall(emitSpy)

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

  it('has less verbose syntax error', async () => {
    file = createFixtureFile({ name: 'error_due_invalid_syntax_spec.js' })

    await expect(runPreprocessor(file))
    .to.eventually.be.rejected
    .and.to.matchSnapshot
  })

  it('triggers rerun on syntax error', async () => {
    file = createFixtureFile({ shouldWatch: true })

    await runPreprocessor(file)

    const emitSpy = spyOnEmitMethod(file)

    await file.writeOnInputFile('{')

    await awaitForRerunCall(emitSpy)

    await expect(runPreprocessor(file))
    .to.eventually.be.rejected
    .and.to.matchSnapshot
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

    await expect(runPreprocessor(file))
    .to.eventually.be.rejected
    .and.to.matchSnapshot

    expect(emitSpy).not.to.be.calledWith('rerun')

    await file.writeOnInputFile('console.log()')

    await awaitForRerunCall(emitSpy)
  })
})

function runPreprocessor (file: FixtureFile, options: undefined | PreprocessorOptions = undefined): Promise<string> {
  return preprocessor(options)(file)
}

function spyOnEmitMethod (file: FixtureFile) {
  return sinon.spy(file, 'emit')
}

function awaitForRerunCall (emitSpy: sinon.SinonSpy<[string | symbol, ...any[]], boolean>) {
  return retry(() => expect(emitSpy).calledWith('rerun'))
}
