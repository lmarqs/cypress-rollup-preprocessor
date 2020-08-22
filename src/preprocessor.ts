import { EventEmitter } from 'events'
import { RollupOptions, OutputOptions } from 'rollup'

import { watch, watchersOutput } from './watch'
import { build } from './build'

export type FileObject =
  & EventEmitter
  & {
    filePath: string
    outputPath: string
    shouldWatch: boolean
  }
  ;

export interface ProcessingOptions {
  rollupOptions?: Partial<RollupOptions>
}

export function createPreprocessor (options: ProcessingOptions = {}) {
  return async (file: FileObject) => watchersOutput[file.filePath] ?? processFile(options, file)
}

async function processFile (options: ProcessingOptions, file: FileObject): Promise<string> {
  const rollupOptions: RollupOptions = Object.assign({}, options.rollupOptions, {
    input: file.filePath,
  })

  const outputOptions: OutputOptions = {
    file: file.outputPath,
    format: 'umd',
  }

  if (file.shouldWatch) {
    return watch(rollupOptions, outputOptions, file)
  }

  return build(rollupOptions, outputOptions)
}
