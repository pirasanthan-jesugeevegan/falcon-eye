import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

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
    alias: {
      '@': path.resolve(__dirname, './src'),
      // @hookform/resolvers imports zod/v4/core; pin to frontend zod@4
      // so Vite/esbuild does not pick up zod@3 from other workspace deps.
      zod: path.resolve(__dirname, './node_modules/zod'),
    },
    dedupe: ['zod'],
  },
  optimizeDeps: {
    include: ['zod', '@hookform/resolvers/zod'],
  },
});
