import path from 'path';
import { createRequire } from 'module';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const require = createRequire(import.meta.url);
const zodRoot = path.dirname(require.resolve('zod/package.json'));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      // Pin every zod import (including zod/v4/core) to the frontend's zod@4.
      // A plain "zod" alias does not rewrite subpath imports.
      { find: /^zod$/, replacement: zodRoot },
      { find: /^zod\/(.*)/, replacement: `${zodRoot}/$1` },
    ],
    dedupe: ['zod'],
  },
  optimizeDeps: {
    include: ['zod', '@hookform/resolvers/zod'],
  },
});
