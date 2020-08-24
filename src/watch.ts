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

  watcher.on('event', createBuildFinishedListener(file))

  return new Promise((resolve, reject) => {
    watcher.on('event', createOutputEmittedListener(watcherKey, resolve, reject))
  })
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

function createBuildFinishedListener (file: EventEmitter) {
  let firstBuild = true

  return (e: RollupWatcherEvent) => {
    if (['END', 'ERROR'].includes(e.code)) {
      if (firstBuild) {
        firstBuild = false
      } else {
        file.emit('rerun')
      }
    }
  }
}

function createOutputEmittedListener (watcherKey: string, resolve: (output: string) => any, reject: (reason: any) => any) {
  return (e: RollupWatcherEvent) => {
    if (e.code === 'BUNDLE_END') {
      lastWatchersOutputEmmitedEvents[watcherKey] = e
      resolve(e.output[0])
    }

    if (e.code === 'ERROR') {
      lastWatchersOutputEmmitedEvents[watcherKey] = e
      reject(e.error)
    }
  }
}
