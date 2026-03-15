import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import svgLoader from 'vite-svg-loader';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'node:path';
import autoprefixer from 'autoprefixer';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import electron from 'vite-plugin-electron'
import { copyFileSync, existsSync, mkdirSync } from 'fs'




const __dirname = dirname(fileURLToPath(import.meta.url))

// Custom plugin to copy migrations and shared files
const copyMigrationsPlugin = () => {
  return {
    name: 'copy-migrations',
    closeBundle() {
      // Copy migrations file
      const migrationsSourcePath = path.resolve(__dirname, 'src/electron/migrations.js')
      const migrationsTargetPath = path.resolve(__dirname, 'dist_electron/migrations.js')
      
      if (existsSync(migrationsSourcePath)) {
        // Ensure target directory exists
        const targetDir = path.dirname(migrationsTargetPath)
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true })
        }
        
        copyFileSync(migrationsSourcePath, migrationsTargetPath)
        console.log('✅ Migrations file copied to dist_electron/')
      }

      // Copy shared-utils file
      const sharedSourcePath = path.resolve(__dirname, 'src/modules/shared-utils.js')
      const sharedTargetPath = path.resolve(__dirname, 'dist_electron/shared-utils.js')
      
      if (existsSync(sharedSourcePath)) {
        // Ensure target directory exists
        const sharedTargetDir = path.dirname(sharedTargetPath)
        if (!existsSync(sharedTargetDir)) {
          mkdirSync(sharedTargetDir, { recursive: true })
        }
        
        copyFileSync(sharedSourcePath, sharedTargetPath)
        console.log('✅ Shared utils file copied to dist_electron/')
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron'
  return {
  plugins: [
    createVuePlugin(),
    VueI18nPlugin({
      include: [path.resolve(__dirname, 'src/locales/**')],
      strictMessage: false,
    }),
    nodePolyfills(),
    svgLoader(),
    Components({
      resolvers: [
        (name) => {
          if(name === 'VEmojiPicker')
            return { importName: name, path: 'v-emoji-picker' }
          const yattComponents = ['EmojiPicker' ,'ColorPicker', 'ImageDialog', 'LinkDialog', 'VideoDialog', 'VTiptap']
          if (yattComponents.includes(name)) {
            return { importName: name, path: '@yatt-ai/vuetify-tiptap' }
          }

        },
        VuetifyResolver(),
      ],
    }),
    ...( isElectron ? [
      electron({
        entry: './src/electron/background.js',
        onstart: (options) => {
          if (mode === "electron") {
            options.startup()
          }
        },
        vite: {
          resolve: {
            alias: {
              '@': path.resolve(__dirname, 'src'), // same alias as renderer
            },
          },
          plugins:[
            VueI18nPlugin({
              include: [path.resolve(__dirname, 'src/locales/**')],
              strictMessage: false
            }),
            copyMigrationsPlugin(),
          ],
          build: {
            outDir: 'dist_electron', // output folder for electron files,
            rollupOptions: {
              input: {
                background: "src/electron/background.js",
                preload: "src/electron/preload.js"
              },
              external: ['open', 'fluent-ffmpeg', 'ffmpeg-static', 'ffprobe-static']
            },
          },
        },
      })
    ] : []),
    // electron({
    //   main: {
    //     entry: 'src/background.js',
    //     vite: {
    //       build: {
    //         outDir: 'dist_electron',
    //         rollupOptions: {
    //           external: ['fluent-ffmpeg', 'ffmpeg-static', 'ffprobe-static'],
    //         },
    //       },
    //     },
    //   },
    //   preload: {
    //     input: path.join(__dirname, 'src/preload.js'),
    //   },
    // }),
    // electron({
    //   main: {
    //     entry: 'src/background.js',
    //     vite: {
    //       build: {
    //         outDir: 'dist-electron',
    //       }
    //     }
    //   },
    //   preload: {
    //     input: 'src/preload.js'
    //   }
    // }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vuetify/lib/components/VTiptap': '@yatt-ai/vuetify-tiptap'
    },
    // TODO - remove .vue and add it when importing
    extensions: [ '.js', '.ts', '.json', '.vue' ],
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      output: {
        manualChunks: {
          // This replaces the splitChunks configuration
          vendor: ['vue', 'vue-router', 'vuex'],
          vuetify: ['vuetify'],
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: [ autoprefixer() ],
    },
  },
  server: {
    hmr: {
      overlay: true
    }
  },
  define: {
    'process.env.FLUENTFFMPEG_COV': false, // Replaces the define plugin in electron builder
  },
}
})