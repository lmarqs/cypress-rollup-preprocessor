import * as rollup from 'rollup'
import { FileObject } from './types'

export const watchOutputCache: Record<string, string> = {}

export function watch (rollupOptions: rollup.RollupOptions, outputOptions: rollup.OutputOptions, file: FileObject) {
  const rollupWatcher = rollup.watch({
    ...rollupOptions,
    output: outputOptions,
  })

  file.on('close', () => {
    rollupWatcher.close()
    delete watchOutputCache[file.filePath]
  })

  rollupWatcher.on('event', (e) => {
    switch (e.code) {
      case 'BUNDLE_END':
        watchOutputCache[file.filePath] = e.output[0]
        break
      case 'ERROR':
        delete watchOutputCache[file.filePath]
        file.emit('rerun')
        break
      case 'END':
        file.emit('rerun')
        break
      default:
        break
    }
  })
}
