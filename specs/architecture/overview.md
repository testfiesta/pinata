<!-- spec-meta last-updated-sha: HEAD last-updated-pr: null last-updated-date: 2026-02-20 spec-version: 1.0 -->

# Architecture Spec: Overview

## Electron Main/Renderer Split

Pinata is a standard Electron application. The entry point for the main process is `src/background.js`. The Vue application runs in the renderer process.

### Main Process (`src/background.js`)

On startup, the main process:

1. Calls `persistenceUtility.initializeSession()` to open all JSON database files and run any pending data migrations
2. Reads the config to check `debugMode` — if enabled, forces development mode (DevTools open)
3. Registers a custom `app://` protocol scheme
4. Sets a request interceptor on `session.defaultSession` to inject `User-Agent: "PINATA"` into all outbound requests (required for Jira token API compatibility)
5. Creates the main window via `windowUtility.getMainWindow()`
6. Loads the Vue application into the window
7. Creates the native application menu via `createMenu(win, isDevelopment)` in `src/menu.js`
8. Registers all IPC handlers by importing `src/modules/IpcHandlers.js`

When all windows are closed, `serverUtility.stopServer()` is called to kill the OAuth local server process.

### Renderer Process

The renderer is a standard Vue 2 SPA loaded from the Electron `BrowserWindow`. In development it loads from the webpack dev server (`http://localhost:8080`). In production it loads from `app://./index.html`.

The renderer communicates with the main process exclusively via the `window.ipc` API, which is injected by the preload script and provides:
- `window.ipc.invoke(channel, data)` — for request/response calls
- `window.ipc.on(channel, func)` — for one-way event listeners from the main process

All file I/O, capture operations, and system queries go through IPC. The renderer never touches the filesystem directly.

### Web Mode

Pinata can also be served as a web application (without Electron). In this mode `navigator.userAgent` does not contain `"Electron"`, so `StorageService` selects `RestApiService` instead of `LocalJsonDbService`. Capture operations use `navigator.mediaDevices.getDisplayMedia()` directly instead of Electron's `desktopCapturer`. Some features (window source selection, local file access, PDF export) are not available in web mode.

---

## IPC Architecture

IPC is centralized in `src/modules/IpcHandlers.js`. All handlers use `ipcMain.handle()` (request/response model). The handlers are grouped by a `channel` string corresponding to an `IPC_HANDLERS` constant:

| Channel | Handler purpose |
|---|---|
| `capture` | Screen capture, image/video/audio create/update/delete, file upload, drop |
| `persistence` | JSON database reads and writes (state, items, config, credentials, metadata) |
| `fileSystem` | Session creation/save/open/export/delete, config/credentials file pickers |
| `window` | Window sizing, opening/closing settings/lowprofile/modal windows |
| `menu` | Update native menu item enabled state |
| `server` | Start/stop the local OAuth server |
| `systemInfo` | Collect system hardware and OS information |
| `browser` | Reserved; currently no-op |

The renderer calls IPC via `ElectronService` (`src/services/electronService.js`), a class that wraps all `window.ipc.invoke()` calls with typed method signatures. This service is installed as a Vue prototype plugin and accessed via `this.$electronService` in components.

The preload script (`src/preload.js`) exposes `window.ipc` via Electron's `contextBridge.exposeInMainWorld()`. The `invoke` method proxies to `ipcRenderer.invoke()`. The `on` method removes any previous listener for the channel before adding the new one (preventing duplicate listeners on hot reload). The `event` parameter is stripped from listener callbacks to prevent exposure of the sender.

---

## Local Storage: JSON Database

### Library

Pinata uses `simple-json-db` for local persistence. Each database is a single JSON file on disk. Files are opened with `jsonSpaces: 2` for human-readable formatting.

### Database Files

All files live in Electron's `userData` directory (returned by `app.getPath("userData")`):

| File | Purpose |
|---|---|
| `meta.json` | App metadata: paths to config/credentials/session data files, app version |
| `config.json` | User preferences (or custom path set by tester) |
| `credentials.json` | Auth tokens for all integrations (or custom path set by tester) |
| `sessions/<sessionID>/sessionData.json` | Active session data (case, session, items) |

### Meta Database

The meta database (`meta.json`) is always at the default `userData` path. It stores:
- `configPath` — absolute path to the config file (default: `userData/config.json`)
- `credentialsPath` — absolute path to the credentials file (default: `userData/credentials.json`)
- `sessionDataPath` — absolute path to the currently active session data file
- `version` — installed app version (used for migration logic)
- `sessionPath` — root directory for session folders (default: `userData/sessions`)

The `configPath` and `credentialsPath` can be changed by the tester in Settings > General to point to shared team files. When changed, `PersistenceUtility.updateMetadata()` immediately switches the database references to the new files.

### Config Database

`defaultConfig` in `PersistenceUtility.js` defines all config keys and their defaults:

```json
{
  "localOnly": false,
  "theme": "light",
  "defaultColor": "#1976D2FF",
  "commentType": "Comment",
  "audioCapture": false,
  "videoQuality": "high",
  "debugMode": false,
  "summaryRequired": false,
  "ai": { "enabled": false },
  "defaultTags": [],
  "templates": { "image": ..., "video": ..., "audio": ..., "text": ..., "file": ..., "mindmap": ... },
  "checklist": { "presession": ..., "postsession": ... },
  "hotkeys": { "general": ..., "home": ..., "sessionPlanning": ..., "workspace": ..., "evidence": ... },
  "logo": { "enabled": false, "path": "", "name": "", "size": 0 },
  "cache": { "retentionPeriod": 7 },
  "colors": { "shapeColor": ..., "markerColor": ..., "connectorColor": ..., "textColor": ... }
}
```

On startup, the stored config is recursively merged with `defaultConfig` via `recursivelyMerge()`. This means new config keys introduced in an update are added with their default values, and existing tester values are preserved. If a key's type has changed (e.g., from string to object), the new default type wins.

### Session Data Database

Each session has its own database file at `userData/sessions/<sessionID>/sessionData.json`. Media files for the session are stored as siblings in the same directory (`userData/sessions/<sessionID>/`).

The session data file contains:
```json
{
  "case": { "caseID": "...", "title": "...", "charter": {...}, "preconditions": {...}, "duration": 0 },
  "session": {
    "sessionID": "...",
    "status": "pending|start|pause|end|...",
    "timer": 0,
    "started": "<iso>",
    "ended": "<iso>",
    "quickTest": false,
    "items": [...],
    "notes": { "content": "", "text": "" },
    "nodes": [...],
    "connections": [...]
  },
  "version": "1.0.0"
}
```

When an item is added, updated, or deleted in the main process, `browserWindow.webContents.send("DATA_CHANGE")` is sent to the renderer, which reloads the item list.

Similarly, `CONFIG_CHANGE`, `CREDENTIAL_CHANGE`, and `META_CHANGE` events notify the renderer of changes to those files.

### Cache Cleanup

`FileSystemUtility.deleteSession("old")` deletes session folders older than `config.cache.retentionPeriod` (default: 7 days) by comparing folder modification times. `deleteSession("all")` recursively deletes the entire sessions directory. This is triggered from Settings > General.

---

## Vuex State

The Vuex store (`src/store/`) uses `vuex-persist` to persist state across renderer reloads.

**Modules:**

- `auth` module — holds `credentials` (all integration tokens). Loaded from the persistence layer at startup.
- `config` module — holds the full config object and computed getters (`hotkeys`, `postSessionData`, `fullConfig`, etc.)

**Root state** (in `store-config.js`) holds session-scoped state:
- `case`: `{ caseID, title, charter, preconditions, duration, mindmap }`
- `session`: `{ sessionID, status, timer, started, ended, quickTest, path, isTargetForAll }`
- Items, nodes, and connections for the current session's workspace mind map

The session state is not persisted to Vuex between app restarts — it lives in the JSON database file. The `initializeSession` call at startup re-reads the active session data if `sessionDataPath` is set in the meta database.

---

## Local OAuth Server

The local Express server (`server/server.js`) handles the Atlassian (Jira) OAuth 2.0 callback. It runs on port 64064 (configurable via `VUE_APP_SERVER_PORT`).

**Lifecycle:**
- The server is spawned as a child process by `ServerUtility.startServer(vars)` using Node's `child_process.fork()`. Environment variables (clientId, clientSecret, URL, PKCE params) are passed as the `env` parameter of the forked process.
- The child process runs independently of the Electron main process.
- Messages sent via `process.send()` in the child are received in the main process via `serverProcess.on("message", ...)`. On receiving a `{ type: "jira", data }` message, the main process forwards the data to the renderer via `browserWindow.webContents.send("JIRA_LOGIN", data)`.
- `ServerUtility.stopServer()` calls `serverProcess.kill()`. This is called when the app window closes.

**Routes:**
- `GET /oauth2/atlassian` — builds and returns the Atlassian OAuth authorization URL
- `GET /oauth2/atlassian/callback` — receives the auth code from Atlassian, exchanges it for tokens, and sends the result back to the Electron main process via IPC message

The server applies CORS restrictions (origin must match `http://localhost:64064`) and disables the `X-Powered-By` header.

The server also serves static files from `server/images/` (used for success/error HTML pages shown in the browser after OAuth completion).

---

## Window Management

`WindowUtility.js` manages multiple `BrowserWindow` instances:

- **Main window** — 800×600px, frameless, resizable. Created at app startup.
- **Settings window** — opened via `openSettingWindow()`. Loads the `/settings` route.
- **Low-profile (mini) window** — 400×84px. Opened via `openLowProfileWindow()`. Loads the `/minimize` route. This is a floating compact control bar for use while the tester is in other applications.
- **Modal windows** — generic modal windows opened via `openModalWindow()`. Used for OAuth flows.
- **PDF window** — created on-the-fly by `FileSystemUtility.exportSession()` to render the `/print` route and call `printToPDF()`. Not visible to the user.

`BrowserWindowUtility.js` maintains a reference to the current main window (`browserWindow`). This reference is used by `PersistenceUtility` and other main-process modules to send events back to the renderer.

---

## Data Migration

`PersistenceUtility.js` includes a migration system that runs on every app startup when the installed version differs from the version stored in the database.

Migration files live in `src/modules/migrations/` (in development) or `resources/migrations/` (in production, bundled as an `extraResource`). File names are version numbers (e.g., `v0.6.0.js`, `v0.8.0.js`, `v0.11.0.js`).

Each migration file exports a `migrationStruct` with `up` and `down` directions. Each direction can have operations for `meta`, `config`, `credentials`, and `data` document types. Operations are key-to-key renames (lateral or nested) or transformation functions.

The migration system:
1. Compares the current app version to the stored version
2. Determines if migrating up or down
3. Finds the first applicable migration file
4. Runs all migrations from that point through the latest
5. After migrations, recursively merges the result with the current `defaultConfig` to fill in any newly added keys

---

## Capture Pipeline (Main Process)

`CaptureUtility.js` handles all media file operations in the main process:

- **createImage(data):** Decodes a base64 PNG data URL, writes a `.png` file to the session directory. File name: `<uuid>.png`. Returns `{ status, message, item: { fileName, filePath, fileType } }`.
- **updateImage(data):** Overwrites an existing image file with a new data URL (used by the image editor).
- **createVideo(data):** Receives an `ArrayBuffer` (webm recording), converts it to an MP4 using `fluent-ffmpeg` (via `ffmpeg-static` and `ffprobe-static`), writes it to the session directory. File name: `<uuid>.mp4`.
- **updateVideo(data):** Trims a video using ffmpeg between `start` and `end` timestamps.
- **optimizeVideo(data):** Re-encodes a video file using ffmpeg for optimization.
- **createAudio(data):** Receives an `ArrayBuffer` (webm audio), writes it as an `.mp3` file. File name: `<uuid>.mp3`.
- **updateAudio(data):** Overwrites an existing audio file.
- **uploadEvidence(data):** Opens a native file picker dialog, copies the selected file into the session directory, detects its MIME type using `detect-file-type`, and returns the item metadata.
- **dropFile(data):** Copies a file dropped onto the app into the session directory.
- **deleteFile(data):** Deletes a file from the session directory.
- **setAppearance(data):** Notifies the renderer to change theme (dark/light).
- **getMediaSource():** Returns available screen sources via Electron's `desktopCapturer.getSources({ types: ["window", "screen"] })`.
