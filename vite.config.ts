import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@core': path.resolve(__dirname, './src/core'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@tests': path.resolve(__dirname, './src/tests'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
