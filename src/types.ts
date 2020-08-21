import { EventEmitter } from 'events'

export type FileObject =
  & EventEmitter
  & {
    filePath: string
    outputPath: string
    shouldWatch: boolean
  }
  ;
