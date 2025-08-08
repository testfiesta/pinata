const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    plugins: [new NodePolyfillPlugin()],
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
  },
  pluginOptions: {
    electronBuilder: {
      externals: ["fluent-ffmpeg", "ffmpeg-static", "ffprobe-static"],
      chainWebpackRendererProcess: (config) => {
        config.plugin("define").tap((args) => {
          args[0]["process.env.FLUENTFFMPEG_COV"] = false;
          return args;
        });
      },
      preload: "src/preload.js",
      mainProcessWatch: [
        "src/modules/CaptureUtility.js",
        "src/modules/DatabaseUtility.js",
        "src/modules/FileSystemUtility.js",
        "src/modules/MenuUtility.js",
        "src/modules/WindowUtility.js",
        "src/modules/ServerUtility.js",
      ],
      builderOptions: {
        productName: "Pinata",
        appId: "com.testfiesta.pinata",
        directories: {
          output: "release",
          buildResources: "public",
        },
        afterSign: "electron-builder-notarize",
        extraResources: [
          {
            from: "server",
            to: "server",
          },
          {
            from: "src/modules/migrations",
            to: "migrations",
          },
        ],
        dmg: {
          artifactName: "${productName}-${version}-${arch}.${ext}",
          icon: false,
          contents: [
            {
              x: 410,
              y: 150,
              type: "link",
              path: "/Applications",
            },
            {
              x: 130,
              y: 150,
              type: "file",
            },
          ],
          publish: [
            {
              provider: "github",
              owner: "testfiesta",
              repo: "pinata",
              releaseType: "prerelease",
            },
          ],
        },
        mac: {
          hardenedRuntime: true,
          icon: "icons/icon.icns",
          category: "public.app-category.developer-tools",
          publish: [
            {
              provider: "github",
              owner: "testfiesta",
              repo: "pinata",
              releaseType: "prerelease",
            },
          ],
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          installerIcon: "icons/icon.ico",
        },
        win: {
          icon: "icons/icon.ico",
          signingHashAlgorithms: ["sha256"],
          sign: "./build/signWindows.js",
          target: ["nsis"],
          publish: [
            {
              provider: "github",
              owner: "testfiesta",
              repo: "pinata",
              releaseType: "prerelease",
            },
          ],
        },
        linux: {
          icon: "icons/linux",
          target: ["AppImage"],
          category: "Development",
          publish: [
            {
              provider: "github",
              owner: "testfiesta",
              repo: "pinata",
              releaseType: "prerelease",
            },
          ],
        },
      },
    },
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true,
      includeLocales: false,
      enableBridge: true,
    },
  },
};
