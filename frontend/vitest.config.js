import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    alias: {
      '@': resolve(__dirname, '.'),
      '#imports': resolve(__dirname, './.nuxt/imports.d.ts'),
      '#app': resolve(__dirname, './tests/unit/mock-app.js'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    }
  },
  define: {
    'import.meta.client': true
  }
})
