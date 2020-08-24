import { EventEmitter } from 'events'
import chai, { assert, expect } from 'chai'
import fs from 'fs-extra'
import path from 'path'
import retry from 'bluebird-retry'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import snapshot from 'snap-shot-it'

import preprocessor, { FileObject, PreprocessorOptions } from '../../src'

chai.use(sinonChai)

const fixturesDir = path.join(__dirname, '..', 'fixtures')
const outputDir = path.join(__dirname, '..', '_test-output')

const createFile = ({ name = 'example_spec.js', shouldWatch = false } = {}) => {
  return Object.assign(new EventEmitter(), {
    filePath: path.join(outputDir, name),
    outputPath: path.join(outputDir, name.replace('.', '_output.')),
    shouldWatch,
  })
}

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

    return processAndSaveSnapshot(file)
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

    return processAndSaveSnapshot(file, options)
  })

  it('correctly reprocesses the file after a modification', async () => {
    file = createFile({ shouldWatch: true })

    const _emit = sinon.spy(file, 'emit')

    await preprocessor()(file)

    await fs.outputFile(file.filePath, `console.log()`)

    await retry(() => expect(_emit).calledWith('rerun'))

    return processAndSaveSnapshot(file)
  })

  it('support watching the same file multiple times', async () => {
    file = createFile({ shouldWatch: true })

    const outputs = await Promise.all([
      preprocessor()(file),
      preprocessor()(file),
    ])

    expect(fs.readFileSync(outputs[0]).toString()).to.be.equal(fs.readFileSync(outputs[1]).toString())
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
      snapshot(normalizeErrorMessage(err.message))
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

async function processAndSaveSnapshot (file: FileObject, options?: PreprocessorOptions) {
  const outputPath = await preprocessor(options)(file)

  snapshot(fs.readFileSync(outputPath).toString())
}

function normalizeErrorMessage (message: string) {
  return message.replace(/\/\S+\/_test/g, '<path>/_test')
}
