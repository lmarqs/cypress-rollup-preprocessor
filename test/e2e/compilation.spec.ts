import { EventEmitter } from 'events'
import chai, { assert, expect } from 'chai'
import fs from 'fs-extra'
import path from 'path'
import retry from 'bluebird-retry'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import snapshot from 'snap-shot-it'

import preprocessor, { FileObject } from '../../src'

chai.use(sinonChai)

const fixturesDir = path.join(__dirname, '..', 'fixtures')
const outputDir = path.join(__dirname, '..', '_test-output')

describe('compilation - e2e', () => {
  let file: FileObject

  beforeEach(async () => {
    await fs.remove(outputDir)
    await fs.copy(fixturesDir, outputDir)
  })

  afterEach(async () => {
    file.emit('close')
  })

  it('correctly preprocesses the file', async () => {
    file = createFile()

    const outputPath = preprocessor()(file)

    await assertCompilationOutput(outputPath)
  })

  it('correctly preprocesses the file using plugins', async () => {
    file = createFile({ name: 'exemple_spec.ts' })

    const options = {
      rollupOptions: {
        plugins: [require('rollup-plugin-typescript2')({
          tsconfigOverride: {
            compilerOptions: {
              module: 'esnext',
            },
          },
        })],
      },
    }

    const outputPath = preprocessor(options)(file)

    return assertCompilationOutput(outputPath)
  })

  it('correctly reprocesses the file after a modification', async () => {
    file = createFile({ shouldWatch: true })

    const emitSpy = sinon.spy(file, 'emit')

    await preprocessor()(file)

    await fs.outputFile(file.filePath, `console.log()`)

    await waitForRerunCall(emitSpy)

    const outputPath = preprocessor()(file)

    return assertCompilationOutput(outputPath)
  })

  it('support watching the same file multiple times', async () => {
    file = createFile({ shouldWatch: true })

    const filesContents = await Promise.all([
      preprocessor()(file),
      preprocessor()(file),
    ].map(readFileContent))

    expect(filesContents[0]).to.be.equal(filesContents[1])
  })

  it('has less verbose "Module not found" error', async () => {
    file = createFile({ name: 'imports_nonexistent_file_spec.js' })

    try {
      await preprocessor()(file)
      assert.fail()
    } catch (err) {
      snapshot(normalizeErrorMessage(err.message))
    }
  })

  it('has less verbose syntax error', async () => {
    file = createFile({ name: 'syntax_error_spec.js' })

    const error = preprocessor()(file)

    await assertCompilationError(error)
  })

  it('triggers rerun on syntax error', async () => {
    file = createFile({ shouldWatch: true })

    await preprocessor()(file)

    const emitSpy = sinon.spy(file, 'emit')

    await fs.outputFile(file.filePath, '{')

    await waitForRerunCall(emitSpy)

    const error = preprocessor()(file)

    await assertCompilationError(error)
  })

  it('does not call rerun on initial build, but on subsequent builds', async () => {
    file = createFile({ shouldWatch: true })
    const emitSpy = sinon.spy(file, 'emit')

    await preprocessor()(file)

    expect(emitSpy).not.to.be.calledWith('rerun')

    await fs.outputFile(file.filePath, 'console.log()')

    await waitForRerunCall(emitSpy)
  })

  it('does not call rerun on errored initial build, but on subsequent builds', async () => {
    file = createFile({ name: 'syntax_error_spec.js', shouldWatch: true })
    const emitSpy = sinon.spy(file, 'emit')

    const error = preprocessor()(file)

    await assertCompilationError(error)

    expect(emitSpy).not.to.be.calledWith('rerun')

    await fs.outputFile(file.filePath, 'console.log()')

    await waitForRerunCall(emitSpy)
  })
})

async function assertCompilationError (error: Promise<any>) {
  try {
    await error
    assert.fail()
  } catch (e) {
    snapshot(normalizeErrorMessage(e.message))
  }
}

async function assertCompilationOutput (outputPath: string | Promise<string>) {
  snapshot(await readFileContent(outputPath))
}

function createFile ({ name = 'example_spec.js', shouldWatch = false } = {}) {
  return Object.assign(new EventEmitter(), {
    filePath: path.join(outputDir, name),
    outputPath: path.join(outputDir, name.replace('.', '_output.')),
    shouldWatch,
  })
}

async function readFileContent (outputPath: string | Promise<string>) {
  return fs.readFileSync(await outputPath).toString()
}

function normalizeErrorMessage (message: string) {
  return message.replace(/\/\S+\/_test/g, '<path>/_test')
}

function waitForRerunCall (emitSpy: sinon.SinonSpy<[string | symbol, ...any[]], boolean>) {
  return retry(() => expect(emitSpy).calledWith('rerun'))
}
