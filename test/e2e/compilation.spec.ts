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

  it('correctly preprocesses the file', () => {
    file = createFile()

    const outputPath = preprocessor()(file)

    return assertOutput(outputPath)
  })

  it('correctly preprocesses the file using plugins', () => {
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

    const outputPath = preprocessor()(file)

    return assertOutput(outputPath)
  })

  it('correctly reprocesses the file after a modification', async () => {
    file = createFile({ shouldWatch: true })

    const _emit = sinon.spy(file, 'emit')

    await preprocessor()(file)

    await fs.outputFile(file.filePath, `console.log()`)

    await retry(() => expect(_emit).calledWith('rerun'))

    const outputPath = preprocessor()(file)

    return assertOutput(outputPath)
  })

  it('support watching the same file multiple times', async () => {
    file = createFile({ shouldWatch: true })

    const outputs = await Promise.all([
      preprocessor()(file),
      preprocessor()(file),
    ])

    expect(readFileContent(outputs[0])).to.be.equal(readFileContent(outputs[1]))
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

    try {
      await preprocessor()(file)
      assert.fail()
    } catch (err) {
      assertError(err)
    }
  })

  it('triggers rerun on syntax error', async () => {
    file = createFile({ shouldWatch: true })

    await preprocessor()(file)

    const _emit = sinon.spy(file, 'emit')

    await fs.outputFile(file.filePath, '{')

    await retry(() => expect(_emit).calledWith('rerun'))

    try {
      await preprocessor()(file)
      assert.fail()
    } catch (err) {
      expect(err.message).to.not.be.empty
    }
  })

  it('does not call rerun on initial build, but on subsequent builds', async () => {
    file = createFile({ shouldWatch: true })
    const _emit = sinon.spy(file, 'emit')

    await preprocessor()(file)

    expect(_emit).not.to.be.calledWith('rerun')

    await fs.outputFile(file.filePath, 'console.log()')

    await retry(() => expect(_emit).calledWith('rerun'))
  })

  it('does not call rerun on errored initial build, but on subsequent builds', async () => {
    file = createFile({ name: 'syntax_error_spec.js', shouldWatch: true })
    const _emit = sinon.spy(file, 'emit')

    try {
      await preprocessor()(file)
      assert.fail()
    } catch (err) {
      expect(err.message).to.not.be.empty
    }

    expect(_emit).not.to.be.calledWith('rerun')

    await fs.outputFile(file.filePath, 'console.log()')

    await retry(() => expect(_emit).calledWith('rerun'))
  })
})

function assertError (err: Error) {
  snapshot(normalizeErrorMessage(err.message))
}

async function assertOutput (outputPath: string | Promise<string>) {
  snapshot(readFileContent(outputPath))
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
