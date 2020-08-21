import rollup from 'rollup'
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
    if (e.code === 'BUNDLE_END') {
      watchOutputCache[file.filePath] = e.output[0]
    }

    if (['END', 'ERROR'].includes(e.code)) {
      file.emit('rerun')
    }
  })
}
