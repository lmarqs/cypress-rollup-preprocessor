import rollup from 'rollup'
import { watch, watchOutputCache } from './watch'
import { FileObject } from './types'
import { build } from './build'

interface ProcessingOptions {
  rollupOptions?: Partial<rollup.RollupOptions>
}

async function processFile (options: ProcessingOptions, file: FileObject): Promise<string> {
  if (watchOutputCache[file.filePath]) {
    return watchOutputCache[file.filePath]
  }

  const rollupOptions: rollup.RollupOptions = Object.assign({}, options.rollupOptions, {
    input: file.filePath,
  })

  const outputOptions: rollup.OutputOptions = {
    file: file.outputPath,
    format: 'umd',
  }

  await build(rollupOptions, outputOptions)

  if (file.shouldWatch) {
    watch(rollupOptions, outputOptions, file)
  }

  return file.outputPath
}

export function createPreprocessor (options: ProcessingOptions = {}) {
  return (fileObject: FileObject) => processFile(options, fileObject)
}
