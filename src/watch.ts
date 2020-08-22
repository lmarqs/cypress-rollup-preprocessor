import { watch as rollupWatcher, RollupOptions, OutputOptions } from 'rollup'
import { EventEmitter } from 'events'

export const watchersOutput: Record<string, string> = {}

export function watch (rollupOptions: RollupOptions, outputOptions: OutputOptions, file: EventEmitter): Promise<string> {
  const watchersOutputKey = rollupOptions.input!.toString()

  const watcher = rollupWatcher({
    ...rollupOptions,
    output: outputOptions,
  })

  file.on('close', () => {
    delete watchersOutput[watchersOutputKey]
    watcher.close()
  })

  let firstBuild = true

  return new Promise((resolve, reject) => {
    watcher.on('event', (e) => {
      if (['END', 'ERROR'].includes(e.code)) {
        if (firstBuild) {
          firstBuild = false
        } else {
          file.emit('rerun')
        }
      }

      if (e.code === 'BUNDLE_END') {
        watchersOutput[watchersOutputKey] = e.output[0]
        resolve(watchersOutput[watchersOutputKey])
      }

      if (e.code === 'ERROR') {
        delete watchersOutput[watchersOutputKey]
        reject(e.error)
      }
    })
  })
}
