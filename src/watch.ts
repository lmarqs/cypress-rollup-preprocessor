import { watch as rollupWatcher, RollupOptions, OutputOptions, RollupWatcher } from 'rollup'
import { EventEmitter } from 'events'

export const watchersOutput: Record<string, string> = {}

export const watchers: Record<string, RollupWatcher> = {}

export function watch (rollupOptions: RollupOptions, outputOptions: OutputOptions, file: EventEmitter): Promise<string> {
  const watcherKey = rollupOptions.input!.toString()

  const watcher = watchers[watcherKey] = watchers[watcherKey] ?? rollupWatcher({
    ...rollupOptions,
    output: outputOptions,
  })

  file.on('close', () => {
    watcher.close()
    delete watchers[watcherKey]
    delete watchersOutput[watcherKey]
  })

  let firstBuild = true

  return new Promise((resolve, reject) => {
    watcher.on('event', (e) => {
      if (e.code === 'BUNDLE_END') {
        watchersOutput[watcherKey] = e.output[0]
        resolve(watchersOutput[watcherKey])
      }

      if (e.code === 'ERROR') {
        delete watchersOutput[watcherKey]
        reject(e.error)
      }

      if (['END', 'ERROR'].includes(e.code)) {
        if (firstBuild) {
          firstBuild = false
        } else {
          file.emit('rerun')
        }
      }
    })
  })
}
