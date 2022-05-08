import { rollup as rollupBuilder, InputOptions, OutputOptions } from 'rollup'

export async function build (inputOptions: InputOptions, outputOptions: OutputOptions): Promise<string> {
  const builder = await rollupBuilder(inputOptions)

  await builder.write(outputOptions)

  return outputOptions.file!.toString()
}
