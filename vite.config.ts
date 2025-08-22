import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import svgLoader from 'vite-svg-loader';
import electron from 'vite-plugin-electron/simple'
import renderer from 'vite-plugin-electron-renderer'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'node:path';
import autoprefixer from 'autoprefixer';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'




const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
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
    renderer()
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
})