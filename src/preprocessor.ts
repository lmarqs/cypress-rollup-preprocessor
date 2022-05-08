import { EventEmitter } from 'events'
import { RollupOptions, OutputOptions, InputOptions } from 'rollup'

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
  inputOptions?: Partial<InputOptions>
  outputOptions?: Partial<OutputOptions>
}

export function preprocessor (options: PreprocessorOptions = {}) {
  return async (file: FileObject) => processFile(options, file)
}

async function processFile (options: PreprocessorOptions, file: FileObject): Promise<string> {
  const inputOptions: RollupOptions = Object.assign({}, options.inputOptions, {
    input: file.filePath,
  })

  const watcherCachedOutput = getWatcherCachedOutput(inputOptions)

  if (watcherCachedOutput) {
    return watcherCachedOutput
  }

  const outputOptions: OutputOptions = Object.assign({}, options.outputOptions, {
    file: file.outputPath,
  })

  if (file.shouldWatch) {
    return watch(inputOptions, outputOptions, file)
  }

  return build(inputOptions, outputOptions)
}
