import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: __dirname, // ⭐ これが重要

  resolve: {
    alias: {
      '@core-client': path.resolve(__dirname, '../core/client/src'),
      hooks: path.resolve(__dirname, './hooks'), // ⭐ 追加
      '@game': path.resolve(__dirname, '../game/client/src'),
    },
  },

  server: {
    fs: {
      allow: ['..'],
    },
  },
});
