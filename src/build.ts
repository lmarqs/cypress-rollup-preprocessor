import { rollup as rollupBuilder, RollupOptions, OutputOptions } from 'rollup'

export async function build (rollupOptions: RollupOptions, outputOptions: OutputOptions): Promise<string> {
  const builder = await rollupBuilder(rollupOptions)

  await builder.write(outputOptions)

  return outputOptions.file!.toString()
}
