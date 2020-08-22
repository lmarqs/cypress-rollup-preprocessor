import { EventEmitter } from 'events'
import chai, { expect } from 'chai'
import fs from 'fs-extra'
import path from 'path'
import retry from 'bluebird-retry'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import snapshot from 'snap-shot-it'

import { createPreprocessor, FileObject } from '../../src/preprocessor'

chai.use(sinonChai)

const normalizeErrMessage = (message: string) => {
  return message.replace(/\/\S+\/_test/g, '<path>/_test')
}

const fixturesDir = path.join(__dirname, '..', 'fixtures')
const outputDir = path.join(__dirname, '..', '_test-output')

const createFile = ({ name = 'example_spec.js', shouldWatch = false } = {}) => {
  return Object.assign(new EventEmitter(), {
    filePath: path.join(outputDir, name),
    outputPath: path.join(outputDir, name.replace('.', '_output.')),
    shouldWatch,
  })
}

describe('rollup createPreprocessor - e2e', () => {
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

    return createPreprocessor()(file).then((outputPath) => {
      snapshot(fs.readFileSync(outputPath).toString())
    })
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

    return createPreprocessor(options)(file).then((outputPath) => {
      snapshot(fs.readFileSync(outputPath).toString())
    })
  })

  it('correctly reprocesses the file after a modification', async () => {
    file = createFile({ shouldWatch: true })

    const _emit = sinon.spy(file, 'emit')

    await createPreprocessor()(file)

    await fs.outputFile(file.filePath, `console.log()`)

    await retry(() => expect(_emit).calledWith('rerun'))

    return createPreprocessor()(file).then((outputPath) => {
      snapshot(fs.readFileSync(outputPath).toString())
    })
  })

  it('has less verbose "Module not found" error', async () => {
    file = createFile({ name: 'imports_nonexistent_file_spec.js' })

    try {
      await createPreprocessor()(file)
      throw new Error('Should not resolve')
    } catch (err) {
      snapshot(normalizeErrMessage(err.message))
    }
  })

  it('has less verbose syntax error', async () => {
    file = createFile({ name: 'syntax_error_spec.js' })

    try {
      await createPreprocessor()(file)
      throw new Error('Should not resolve')
    } catch (err) {
      snapshot(normalizeErrMessage(err.message))
    }
  })

  it('triggers rerun on syntax error', async () => {
    file = createFile({ shouldWatch: true })

    await createPreprocessor()(file)

    const _emit = sinon.spy(file, 'emit')

    await fs.outputFile(file.filePath, '{')

    await retry(() => expect(_emit).calledWith('rerun'))
  })

  it('does not call rerun on initial build, but on subsequent builds', async () => {
    file = createFile({ shouldWatch: true })
    const _emit = sinon.spy(file, 'emit')

    await createPreprocessor()(file)

    expect(_emit).not.to.be.calledWith('rerun')

    await fs.outputFile(file.filePath, 'console.log()')

    await retry(() => expect(_emit).calledWith('rerun'))
  })

  it('does not call rerun on errored initial build, but on subsequent builds', async () => {
    file = createFile({ name: 'syntax_error_spec.js', shouldWatch: true })
    const _emit = sinon.spy(file, 'emit')

    try {
      await createPreprocessor()(file)
      throw new Error('Should not resolve')
    } catch (err) {
      expect(err.message).to.not.be.empty
    }

    expect(_emit).not.to.be.calledWith('rerun')

    await fs.outputFile(file.filePath, 'console.log()')

    await retry(() => expect(_emit).calledWith('rerun'))
  })
})
