import { defineConfig } from 'vite'

export default defineConfig({
  base: '/webtest/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    open: true
  }
})