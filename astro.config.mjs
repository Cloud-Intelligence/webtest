import { defineConfig } from 'astro/config';
import compress from '@playform/compress';
import compressor from 'astro-compressor';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://cloudintellligence.africa',
  output: 'static',
  compressHTML: true,
  build: {
    assets: 'assets',
    format: 'directory'
  },
  vite: {
    build: {
      minify: 'esbuild',
      cssMinify: 'lightningcss',
      target: 'es2020',
      sourcemap: false,
      
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'chunks/[name].[hash].js',
          entryFileNames: '[name].[hash].js'
        }
      }
    },
    
    css: {
      lightningcss: {
        targets: {
          chrome: 95,
          firefox: 90,
          safari: 14
        }
      },
      preprocessorOptions: {
        scss: {
          // Enable @use syntax and modern Sass features
          api: 'modern-compiler'
        }
      }
    }
  },
  
  integrations: [
    sitemap(),
    compress(),
    compressor({
      gzip: true,
      brotli: true,
      fileExtensions: ['.css', '.js', '.html', '.xml', '.svg']
    })
  ]
});