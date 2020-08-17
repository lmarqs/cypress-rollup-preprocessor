import typescript from 'rollup-plugin-typescript2'

module.exports = {
  input: './src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: 'esnext',
        },
        include: ['src'],
      },
    }),
  ],
}
