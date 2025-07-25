import { defineConfig } from 'astro/config';
import compress from '@playform/compress';
import compressor from 'astro-compressor';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://cloud-intelligence.github.io',
  base: '/webtest',
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
          manualChunks: {
            vendor: ['gsap'],
            draggable: ['gsap/Draggable']
          },
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
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    compress(),
    compressor({
      gzip: true,
      brotli: true,
      fileExtensions: ['.css', '.js', '.html', '.xml', '.svg']
    })
  ]
});