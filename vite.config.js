import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/expense-tracker/',
  plugins: [vue()],
  css: {
    devSourcemap: true,
  },
  build: {
    sourcemap: false,
  },
})
