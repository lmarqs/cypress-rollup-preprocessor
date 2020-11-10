import fs from 'fs-extra'
import path from 'path'
import { EventEmitter } from 'events'
import { FileObject } from '../../src'

const SAMPLES_DIR = path.join(__dirname, 'samples')
const TEMPORARY_DIR = path.join(__dirname, '_tmp')

export class FixtureFile extends EventEmitter implements FileObject {
  public constructor (private fileName: string, public shouldWatch: boolean) {
    super()
  }

  public static async reset (): Promise<void> {
    await fs.removeSync(TEMPORARY_DIR)
    await fs.copySync(SAMPLES_DIR, TEMPORARY_DIR)
  }

  public get filePath (): string {
    return path.join(TEMPORARY_DIR, this.fileName)
  }

  public get outputPath (): string {
    return path.join(TEMPORARY_DIR, this.fileName.replace('.', '_output.'))
  }

  public async getOutputFileContent (): Promise<string> {
    const buffer = await fs.readFile(this.outputPath)

    return buffer.toString()
  }

  public async writeOnInputFile (content: string): Promise<void> {
    await fs.writeFile(this.filePath, content)
  }

  public close (): void {
    this.emit('close')
  }
}

export function createFixtureFile ({ name = 'success_spec.js', shouldWatch = false } = {}) {
  return new FixtureFile(name, shouldWatch)
}
