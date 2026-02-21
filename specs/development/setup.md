<!-- spec-meta last-updated-sha: HEAD last-updated-pr: null last-updated-date: 2026-02-20 spec-version: 1.0 -->

# Development Spec: Setup

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | >=16.0.0 <19.0.0 |
| npm | >=8.0.0 <9.0.0 |
| yarn | Any recent version |

The project uses Yarn as the primary package manager. The build toolchain uses `vue-cli-service` and `vue-cli-plugin-electron-builder`.

## Installation

```sh
git clone https://github.com/testfiesta/pinata
cd pinata
yarn install
```

The `postinstall` script runs `electron-builder install-app-deps`, which installs native dependencies for the current Electron version and platform. This must succeed for the app to build.

## Running in Development

```sh
yarn dev
```

This runs `vue-cli-service electron:serve`, which:
1. Starts a webpack dev server for the Vue renderer at `http://localhost:8080`
2. Compiles the Electron main process in watch mode
3. Launches Electron pointing to the dev server URL

The main process modules listed in `vue.config.js` under `mainProcessWatch` are watched for changes and trigger a main process restart when edited:
- `src/modules/CaptureUtility.js`
- `src/modules/DatabaseUtility.js`
- `src/modules/FileSystemUtility.js`
- `src/modules/MenuUtility.js`
- `src/modules/WindowUtility.js`
- `src/modules/ServerUtility.js`

When `isDevelopment` is true, the app opens Vue DevTools automatically (using `electron-devtools-installer`).

The `config.debugMode` setting in the config file can force dev mode on in a production build (opens DevTools, logs additional output).

## Running as a Web App (Without Electron)

```sh
yarn serve
```

This runs `vue-cli-service serve` to start the webpack dev server. The Vue app runs in a browser. Screen capture uses `navigator.mediaDevices.getDisplayMedia()` directly. Local file storage is replaced by `RestApiService` (which expects a backend API). PDF and ZIP export are not available in this mode.

## Environment Variables

The app uses two `.env` files:

`.env.production` (committed to the repo):
```
VUE_APP_I18N_LOCALE=en
VUE_APP_I18N_FALLBACK_LOCALE=en
VUE_APP_SERVER_PORT=64064
VUE_APP_TESTFIESTA_API_URL=https://api.testfiesta.com/v1
VUE_APP_JIRA_OAUTH_KEY=3tPI6y3UgOxjUUVd2ELL3mhZr6cGAatt
```

A `.env.development` or `.env.local` file can override these values for local development. The `VUE_APP_SERVER_PORT` controls the port for the local OAuth callback server. The `VUE_APP_TESTFIESTA_API_URL` is the TestFiesta REST API base URL.

## Running Tests

```sh
yarn test:unit
```

This runs `vue-cli-service test:unit` which executes Jest. Test files are located in `__tests__/` subdirectories throughout `src/`. The test setup uses `@vue/test-utils` v1 and `@vue/vue2-jest`.

## Linting

```sh
yarn lint
```

Runs ESLint with `eslint-plugin-vue` and Prettier. The config is in `package.json` under `eslintConfig`. Parser: `@babel/eslint-parser`. Extensions: `plugin:vue/essential` and `eslint:recommended`.

## Building for Distribution

```sh
yarn build
```

Runs `vue-cli-service electron:build`. This:
1. Builds the Vue renderer with webpack
2. Compiles the Electron main process
3. Runs `electron-builder` to produce platform-specific distributables

Output directory: `release/` (configured as `directories.output` in `vue.config.js`).

### Platform Outputs

| Platform | Format | Config key |
|---|---|---|
| macOS | `.dmg` (Intel and Apple Silicon) | `builderOptions.dmg` |
| Windows | NSIS installer (`.exe`) | `builderOptions.win` / `builderOptions.nsis` |
| Linux | `.AppImage` | `builderOptions.linux` |

**macOS:** `hardenedRuntime: true` is required for notarization. Code signing and notarization use `electron-builder-notarize`. The App Store category is `public.app-category.developer-tools`.

**Windows:** Code signing uses a custom sign script (`./build/signWindows.js`). Signing hash algorithm is `sha256`. The installer is NSIS with `oneClick: false` (allows directory selection).

**Linux:** Icon directory is `icons/linux`. Category is `Development`.

### Publish (Release)

```sh
yarn publish
```

Runs `vue-cli-service electron:build -p always`. This builds and uploads to GitHub Releases. The GitHub repository is `testfiesta/pinata`. All platforms publish as `prerelease`.

## Extra Resources

The following directories are included as `extraResources` in the packaged app (accessible at runtime via `process.resourcesPath`):

- `server/` — the local Express OAuth server (spawned as a child process at runtime)
- `src/modules/migrations/` — bundled as `migrations/` — data migration scripts

These must be present in the installed app for OAuth (Jira) and data migrations to work.

## Project Structure

```
pinata/
  src/
    background.js          # Electron main process entry point
    preload.js             # Context bridge for IPC
    menu.js                # Native application menu definition
    main.js                # Vue app entry point
    router/index.js        # Vue Router route definitions
    store/                 # Vuex store (auth, config, session modules)
    views/                 # Top-level Vue route components
    components/            # Shared UI components and dialogs
    integrations/          # API helper classes (TestFiesta, Jira, Xray, etc.)
    services/              # ElectronService, StorageService abstractions
    modules/               # Main-process utilities (Capture, Persistence, etc.)
    helpers/               # Renderer-side helpers (HotkeyHelpers, WebHelpers)
    locales/               # i18n translation files
    assets/                # Icons and images
  server/
    server.js              # Local Express OAuth server
    modules/JiraUtility.js # Jira OAuth callback handler
  docs/
    CONTRIBUTING.md
  vue.config.js            # Vue CLI + Electron Builder configuration
  package.json
  .env.production
```

## Key Configuration in `vue.config.js`

- `externals: ["fluent-ffmpeg", "ffmpeg-static", "ffprobe-static"]` — these native modules are excluded from webpack bundling and loaded directly by Node in the main process
- `preload: "src/preload.js"` — the context bridge preload script
- `chainWebpackRendererProcess` — disables the ffmpeg coverage instrumentation flag in the renderer
- `NodePolyfillPlugin` — adds Node.js polyfills to the renderer webpack bundle (needed for some dependencies that expect Node APIs)
- `splitChunks: { chunks: "all" }` — enables code splitting for the renderer bundle
- `i18n` — locale `en`, locale files in `src/locales/`, enabled in SFCs

## Internationalization

The app uses `vue-i18n` v8. All user-visible strings are keyed in locale JSON files under `src/locales/`. The i18n report can be generated with:

```sh
yarn i18n:report
```

This scans all `.js` and `.vue` files for i18n key usage and reports missing or unused keys.

## macOS Screen Recording Permission

On macOS, Pinata requires the Screen Recording privacy permission to capture screenshots and screen recordings. The tester must grant this manually via System Settings > Privacy & Security > Screen Recording. On a dev build, this permission may not work correctly (known issue noted in README).

## Data Storage Location

During development and in the installed app, all local data is stored in the Electron `userData` directory:

- **macOS:** `~/Library/Application Support/pinata/`
- **Windows:** `%APPDATA%\pinata\`
- **Linux:** `~/.config/pinata/`

To reset all app data during development, delete this directory.
