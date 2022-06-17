import { rollup as rollupBuilder, InputOptions, OutputOptions } from 'rollup'
import { wrapRollupError } from './error'

export async function build (inputOptions: InputOptions, outputOptions: OutputOptions): Promise<string> {
  try {
    const builder = await rollupBuilder(inputOptions)

    await builder.write(outputOptions)

    return outputOptions.file!.toString()
  } catch (e) {
    return Promise.reject(wrapRollupError(e))
  }
}
