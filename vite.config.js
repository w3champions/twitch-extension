import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mkcert(),
  ],
  base: '',
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        config: resolve(__dirname, './config.html'),
        video_overlay: resolve(__dirname, './video_overlay.html'),
      },
    },
  },
  server: {
    port: 8080,
    https: true,
  },
});