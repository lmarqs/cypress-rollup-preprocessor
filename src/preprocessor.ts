import { rollup, watch, OutputOptions, RollupOptions } from 'rollup'
import { EventEmitter } from 'events'

interface ProcessingOptions {
  rollupOptions?: RollupOptions
}

export type FileObject =
  & EventEmitter
  & {
    filePath: string
    outputPath: string
    shouldWatch: boolean
  }
  ;

const cache: Record<string, string> = {}

async function processFile (options: ProcessingOptions, file: FileObject): Promise<string> {
  if (cache[file.filePath]) {
    return cache[file.filePath]
  }

  const rollupOptions: RollupOptions = Object.assign({}, options.rollupOptions, {
    input: file.filePath,
  })

  const outputOptions: OutputOptions = {
    file: file.outputPath,
    format: 'umd',
  }

  const rollupBuild = await rollup(rollupOptions)

  await rollupBuild.write(outputOptions)

  if (file.shouldWatch) {
    const watcher = watch({
      ...rollupOptions,
      output: outputOptions,
    })

    file.on('close', () => {
      watcher.close()
      delete cache[file.filePath]
    })

    watcher.on('event', (e) => {
      if (e.code === 'BUNDLE_END') {
        cache[e.input.toString()] = e.output[0]
      }

      if (['END', 'ERROR'].includes(e.code)) {
        file.emit('rerun')
      }
    })
  }

  return file.outputPath
}

export function createPreprocessor(options: ProcessingOptions = {}) {
  return (fileObject: FileObject) => processFile(options, fileObject)
}
