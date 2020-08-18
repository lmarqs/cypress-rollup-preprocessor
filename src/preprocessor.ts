import { rollup, watch, OutputOptions, RollupOptions, RollupWatcher } from 'rollup'
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

const watchers: Record<string, RollupWatcher> = {}

async function processFile (options: ProcessingOptions, file: FileObject): Promise<string> {
  if (watchers[file.filePath]) {
    return file.filePath
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
      delete watchers[file.filePath]
    })

    watcher.on('event', (e) => {
      if (e.code === 'END') {
        file.emit('rerun')
      }
    })

    watchers[file.filePath] = watcher
  }

  return file.outputPath
}

export function createPreprocessor (options: ProcessingOptions = {}) {
  return (fileObject: FileObject) => processFile(options, fileObject)
}
