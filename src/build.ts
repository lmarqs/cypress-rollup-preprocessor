import rollup from 'rollup'

export async function build (rollupOptions: rollup.RollupOptions, outputOptions: rollup.OutputOptions) {
  const rollupBuild = await rollup.rollup(rollupOptions)

  await rollupBuild.write(outputOptions)
}
