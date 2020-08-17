/**
 * Cypress asks file preprocessor to bundle the given file
 * and return the full path to produced bundle.
 */
interface FileObject {
  filePath: string
  outputPath: string
  shouldWatch: boolean
}

type FilePreprocessor = (file: FileObject) => string | Promise<string>

export const preprocessor: FilePreprocessor = async () => {
  throw Error('not implemented yet')
}
