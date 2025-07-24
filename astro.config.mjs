import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://cloud-intelligence.github.io',
  base: '/webtest',
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Enable @use syntax and modern Sass features
          api: 'modern-compiler'
        }
      }
    }
  }
});