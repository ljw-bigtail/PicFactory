import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const { resolve } = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gif: resolve(__dirname, 'gif.html'),
        collage: resolve(__dirname, 'collage.html'),
      }
    }
  },
  base: "/tools/"
})
