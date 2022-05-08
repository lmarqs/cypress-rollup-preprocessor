import { watch as rollupWatcher, InputOptions, OutputOptions, RollupWatcher, RollupWatcherEvent } from 'rollup'
import { EventEmitter } from 'events'

const lastWatchersOutputEmmitedEvents: Record<string, RollupWatcherEvent> = {}

const watchers: Record<string, RollupWatcher> = {}

export async function watch (inputOptions: InputOptions, outputOptions: OutputOptions, file: EventEmitter): Promise<string> {
  const watcherKey = getWatcherKey(inputOptions)

  const watcher = watchers[watcherKey] = watchers[watcherKey] ?? rollupWatcher({
    ...inputOptions,
    output: outputOptions,
  })

  file.on('close', createFileClosedListener(watcherKey))

  return new Promise((resolve, reject) => {
    let firstBuild = true

    watcher.on('event', (e: RollupWatcherEvent) => {
      if (['BUNDLE_END', 'ERROR'].includes(e.code)) {
        setCachedWatcherOutput(inputOptions, e)
      }

      if (['END', 'ERROR'].includes(e.code)) {
        if (firstBuild) {
          firstBuild = false
          getWatcherCachedOutput(inputOptions)!
          .then(resolve)
          .catch(reject)
        } else {
          file.emit('rerun')
        }
      }
    })
  })
}

function setCachedWatcherOutput (inputOptions: InputOptions, e: RollupWatcherEvent) {
  lastWatchersOutputEmmitedEvents[getWatcherKey(inputOptions)] = e
}

function getWatcherKey (inputOptions: InputOptions) {
  return inputOptions.input!.toString()
}

export function getWatcherCachedOutput (inputOptions: InputOptions) {
  const lastEvent = lastWatchersOutputEmmitedEvents[getWatcherKey(inputOptions)]

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
