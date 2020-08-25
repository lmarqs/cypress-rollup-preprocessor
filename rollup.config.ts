import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    exports: 'auto',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          target: 'es5',
          module: 'esnext',
          declaration: true,
        },
      },
    }),
  ],
}
