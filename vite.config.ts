import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import viteCompression from 'vite-plugin-compression'
import path from 'path'
import {reactRouter} from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [
      react(),
      svgr(),
      tailwindcss(),
      isProduction && viteCompression({
        verbose: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false
      })
    ],
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      rollupOptions: {
        input: './app/main.tsx', // 🟢 ajoute ça pour corriger l'entrée
        output: {
          manualChunks: {
            reactDOM: ['react-dom'],
          }
        }
      },
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        format: {
          comments: true
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './app')
      },
      extensions: ['.jsx', '.js', '.tsx', '.ts'],
    },
    css: {
      preprocessorOptions: {
        scss: {},
      }
    },
    server: {
      open: false,
      historyApiFallback: true,

      allowedHosts: ['whispyr.romain-guillemot.dev'],
    }
  }
})
