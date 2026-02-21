<!-- spec-meta last-updated-sha: HEAD last-updated-pr: null last-updated-date: 2026-02-20 spec-version: 1.0 -->

# Feature Spec: Session Recording

## Overview

A Pinata session is the top-level unit of work. It wraps a tester's exploratory activity from the moment they pick a screen to capture until they write a closing summary. Every piece of evidence captured during the session is timestamped relative to session start, and the whole thing can be exported or pushed to downstream systems.

## Session Types

**Exploratory session** — started from the home screen via "New Exploratory Session". Requires the tester to fill in a session charter (title, charter text, preconditions, optional duration) before selecting a screen source. Creates a persistent session record on disk.

**Quick test** — started from the home screen via a dedicated quick-test entry point. Skips charter setup and goes straight to source selection. The session is flagged as `quickTest: true` in the store. Quick test sessions are not persisted to disk via `createNewSession`; the evidence items are still captured in memory and can be exported at the end.

## Pre-Session: Charter Setup

Before a session starts, the tester fills in the charter on the `MainView` screen (route `/main`). The charter fields are:

- **Title** — a short name for the test session
- **Charter** — a rich-text field (TipTap editor) describing what the tester intends to explore
- **Preconditions** — a rich-text field listing setup steps required before testing begins
- **Duration** — an optional time budget in minutes/seconds. When set, the timer counts down and triggers a prompt when it expires

These fields are stored in the Vuex `case` module (`$store.state.case`). The `case` object carries:

```
caseID, title, charter, preconditions, duration, mindmap
```

The charter view also shows a mind map editor backed by D3 (`DEFAULT_CHARTER_MAP_NODES` / `DEFAULT_CHARTER_MAP_CONNECTIONS` from `constants.js`). This mind map represents the planned structure of the session.

## Source Selection

When the tester clicks to start the session, the `ControlPanel` component calls `showSourcePickerDialog()`.

**In Electron:** `$electronService.getMediaSource()` is called via IPC, which triggers `captureUtility.getMediaSource()` in the main process. This returns a list of available screen sources (monitors and windows) from Electron's `desktopCapturer`. The `SourcePickerDialog` shows thumbnails of each source. The tester picks one, and the chosen `sourceId` is stored in `ControlPanel.data.sourceId`.

**In web mode:** `navigator.mediaDevices.getDisplayMedia()` is called directly with `displaySurface: "window"` and `cursor: "always"`. The browser's native picker is used. No source ID is needed because the browser manages the stream reference.

## Session Lifecycle: States

Session state is stored in the Vuex `session` module (`$store.state.session.status`). The state machine has these values (from `SESSION_STATUSES` in `constants.js`):

| State | Meaning |
|---|---|
| `pending` | No session running; charter screen is shown |
| `start` | Session is active and the timer is incrementing |
| `pause` | Session is paused; the timer has stopped; capture buttons are disabled |
| `resume` | Session has been resumed from pause (timer restarts from current value) |
| `proceed` | Session has gone past its configured duration but the tester elected to continue |
| `end` | Session has ended; evidence is frozen; results are shown |

The `ControlPanel` component drives these transitions.

## Starting a Session

`startSession(sourceId)` in `ControlPanel`:

1. Sets `sourceId` in local state
2. Emits `start-session` to the parent view
3. Reads `timer` and `duration` from the store
4. If `duration > 0`, sets `isDuration = true` so the countdown is monitored
5. Records `started = new Date().toISOString()` and commits `setSessionStarted` to the store
6. If the session was not already in `start` state, changes status to `START` and calls `startInterval()`
7. If no `sessionID` exists yet (meaning this is a fresh session, not a resume), calls `$storageService.createNewSession(data)` to create the session record on disk. This passes the current `case` and `session` state
8. Reads the generated `caseID` and `sessionID` from storage and commits them to the store
9. Navigates to `/main/workspace`

## Timer

`startInterval()` sets a `setInterval` running every 1000ms. Each tick:
- Increments `timer` by 1
- Calls `updateStoreSession()` which commits `{status, timer, duration, isForce}` to the store via the `updateSession` mutation
- Checks whether `isDuration && duration <= 0` — if so, shows `DurationConfirmDialog`

The elapsed time is displayed as HH:MM:SS, computed from `timer` (which is the raw count of seconds elapsed).

## Pausing a Session

`pauseSession()`:
- Sets `status = SESSION_STATUSES.PAUSE`
- Calls `changeSessionStatus(PAUSE)` which (in Electron) triggers a native menu item state change via `menuUtility.changeMenuItemStatus`
- Calls `stopInterval()`

All capture buttons in `ControlPanel` are `disabled` when `status === 'pause'`.

## Resuming a Session

`resumeSession()` in Electron:
- Re-fetches available media sources via `fetchSources()`
- If the previously selected source is no longer available (e.g., the window was closed), shows `SourcePickerDialog` again so the tester can pick a new target
- Otherwise, sets `status = SESSION_STATUSES.START` and restarts the interval

In web mode:
- If `this.mediaStream` is null (the user revoked screen access), calls `setMediaStream()` to re-prompt the user
- Sets `status = START` and restarts the interval

## Duration Expiry

When the countdown timer reaches zero, `DurationConfirmDialog` appears with two options:

- **End** — calls `endSession()`, leading to the summary dialog and then session end
- **Proceed** — sets `status = SESSION_STATUSES.PROCEED` and restarts the interval so the session continues without a time limit

## Ending a Session

`endSession()` checks `config.postSessionData.status`. This is a configuration option that determines whether to show a post-session metadata dialog (`EndSessionDialog`) before the summary.

If `postSessionData.status` is true:
1. Shows `EndSessionDialog`
2. On proceed, shows `SummaryDialog`

If `postSessionData.status` is false:
1. Shows `SummaryDialog` directly

`SummaryDialog` prompts the tester to write a final summary. When the tester submits:
1. `addSummary(value)` is called, which creates a summary item (`fileType: "text/plain"`, `comment.type: "Summary"`) and adds it to the session items
2. `endSessionProcess()` is called:
   - Stops all active media streams
   - Clears `sourceId`
   - Records `ended = new Date().toISOString()` and commits `setSessionEnded`
   - Sets `status = SESSION_STATUSES.END`
   - Stops the interval timer
   - Calls `finishSession()` which clears Vuex state and navigates to `/`

## Session Persistence

Each session is stored as a directory on the local filesystem (managed by `FileSystemUtility`). The directory contains:
- A JSON metadata file with case and session fields
- All captured media files (PNG images, MP4 videos, MP3 audio, any uploaded files)
- A JSON items file listing all evidence items with their `stepID`, `fileType`, `comment`, `tags`, `emoji`, `followUp`, and `timer_mark`

Sessions can be saved mid-session via the native File menu (Save Session) or discarded. The `NewSessionDialog` prompts "save or discard" when the tester tries to start a new session while one is in progress.

## Low-Profile (Mini) Mode

Pinata supports a minimized floating window that keeps the control panel visible while the tester works in other applications. `openLowProfileWindow()` in `WindowUtility` opens a small (400x84 px) secondary `BrowserWindow` that loads the `/minimize` route, which renders `LowProfileView`. This view contains `LowProfileControlWrapper`, a compact version of the control buttons (pause/resume, end, screenshot, video, audio, note, mind map, source picker). The main window is hidden while the mini window is open.

## Hotkeys

All session control actions have configurable keyboard shortcuts. The `HotkeysTab` in settings lets the tester reassign any binding. Hotkeys are stored in the `config` object under a nested structure keyed by page (`workspace`, `home`, `sessionPlanning`, etc.) and action. The `ControlPanel` reads hotkeys via `mapGetters` and passes them to `v-shortkey` directives on each button. Default hotkey pages: `general`, `home`, `sessionPlanning`, `workspace`, `evidence`.
