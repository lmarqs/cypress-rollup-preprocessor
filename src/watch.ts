import { watch as rollupWatcher, RollupOptions, OutputOptions, RollupWatcher, RollupWatcherEvent } from 'rollup'
import { EventEmitter } from 'events'

export const watchersOutput: Record<string, string> = {}

export const watchers: Record<string, RollupWatcher> = {}

export function watch (rollupOptions: RollupOptions, outputOptions: OutputOptions, file: EventEmitter): Promise<string> {
  const watcherKey = rollupOptions.input!.toString()

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

function createFileClosedListener (watcherKey: string) {
  return () => {
    watchers[watcherKey]?.close()
    delete watchers[watcherKey]
    delete watchersOutput[watcherKey]
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
      watchersOutput[watcherKey] = e.output[0]
      resolve(watchersOutput[watcherKey])
    }

    if (e.code === 'ERROR') {
      delete watchersOutput[watcherKey]
      reject(e.error)
    }
  }
}
