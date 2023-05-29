export default {
  build: {
    outDir: './src/_js',
    lib: {
      entry: './src/components/img.ts',
      formats: ['es'],
      fileName: (format) => `img.${format}.js`,
      name: 'Img',
    },
    rollupOptions: {
      external: ['lit'],
      output: {
        globals: {
          lit: 'lit'
        }
      }
    }
  }
}