import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es', 'cjs'],
      fileName: format => `common.${format === 'es' ? 'js' : 'cjs'}`,
    },
  },
  resolve: { alias: { src: resolve('src/') } },
  plugins: [dts()],
});
