import { watch as rollupWatcher, RollupOptions, OutputOptions, RollupWatcher, RollupWatcherEvent } from 'rollup'
import { EventEmitter } from 'events'

const lastWatchersOutputEmmitedEvents: Record<string, RollupWatcherEvent> = {}

const watchers: Record<string, RollupWatcher> = {}

export async function watch (rollupOptions: RollupOptions, outputOptions: OutputOptions, file: EventEmitter): Promise<string> {
  const watcherKey = getWatcherKey(rollupOptions)

  const watcher = watchers[watcherKey] = watchers[watcherKey] ?? rollupWatcher({
    ...rollupOptions,
    output: outputOptions,
  })

  file.on('close', createFileClosedListener(watcherKey))

  return new Promise((resolve, reject) => {
    let firstBuild = true

    watcher.on('event', (e: RollupWatcherEvent) => {
      if (['BUNDLE_END', 'ERROR'].includes(e.code)) {
        setCachedWatcherOutput(rollupOptions, e)
      }

      if (['END', 'ERROR'].includes(e.code)) {
        if (firstBuild) {
          firstBuild = false
          getWatcherCachedOutput(rollupOptions)!
          .then(resolve)
          .catch(reject)
        } else {
          file.emit('rerun')
        }
      }
    })
  })
}

function setCachedWatcherOutput(rollupOptions: RollupOptions, e: RollupWatcherEvent) {
  lastWatchersOutputEmmitedEvents[getWatcherKey(rollupOptions)] = e
}

function getWatcherKey (rollupOptions: RollupOptions) {
  return rollupOptions.input!.toString()
}

export function getWatcherCachedOutput (rollupOptions: RollupOptions) {
  const lastEvent = lastWatchersOutputEmmitedEvents[getWatcherKey(rollupOptions)]

  if (lastEvent?.code === 'BUNDLE_END') {
    return Promise.resolve(lastEvent.output[0])
  }

  if (lastEvent?.code === 'ERROR') {
    return Promise.reject(lastEvent.error)
  }

  return null
}

function createFileClosedListener (watcherKey: string) {
  return () => {
    watchers[watcherKey]?.close()
    delete watchers[watcherKey]
    delete lastWatchersOutputEmmitedEvents[watcherKey]
  }
}
