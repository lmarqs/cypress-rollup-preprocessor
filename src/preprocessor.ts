import { EventEmitter } from 'events'
import { RollupOptions, OutputOptions } from 'rollup'

import { watch, getWatcherCachedOutput } from './watch'
import { build } from './build'

export type FileObject =
  & EventEmitter
  & {
    filePath: string
    outputPath: string
    shouldWatch: boolean
  }
  ;

export interface PreprocessorOptions {
  rollupOptions?: Partial<RollupOptions>
}

export function preprocessor (options: PreprocessorOptions = {}) {
  return async (file: FileObject) => processFile(options, file)
}

async function processFile (options: PreprocessorOptions, file: FileObject): Promise<string> {
  const rollupOptions: RollupOptions = Object.assign({}, options.rollupOptions, {
    input: file.filePath,
  })

  const watcherCachedOutput = getWatcherCachedOutput(rollupOptions)

  if (watcherCachedOutput) {
    return watcherCachedOutput
  }

  const outputOptions: OutputOptions = {
    file: file.outputPath,
    format: 'umd',
  }

  if (file.shouldWatch) {
    return watch(rollupOptions, outputOptions, file)
  }

  return build(rollupOptions, outputOptions)
}
