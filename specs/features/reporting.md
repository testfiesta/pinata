<!-- spec-meta last-updated-sha: HEAD last-updated-pr: null last-updated-date: 2026-02-20 spec-version: 1.0 -->

# Feature Spec: Reporting

## Overview

When a session ends, Pinata renders the captured evidence as a structured report. Testers can review and edit the session, then export it in one of two formats: a ZIP archive containing all files, or a rendered PDF. The PDF format is designed for sharing with stakeholders and includes a system environment snapshot alongside the session timeline.

## Session Result View

After a session ends, the app navigates back to the home screen (`/`). The `ResultView` (`/result`) provides a post-session review interface. The `ExportPanel` component is embedded in this view and provides the export controls.

The main session workspace (`/main/workspace`) also shows all items captured so far. Items can be edited and deleted while the session is in progress.

## ExportPanel

`ExportPanel.vue` renders a dropdown button labeled "Export Session Report". The available export options depend on which integrations are configured:

- **Save as ZIP** — always available in Electron
- **Save as PDF** — always available in Electron
- **Export to Xray** — shown when `credentials.xray` is configured
- **Export to Zephyr Squad** — code exists but is hidden with a `false` condition; not exposed in current production UI
- **Export to Zephyr Scale** — code exists but is hidden with a `false` condition; not exposed in current production UI

The `exportSession(type)` method collects:
```
title, charter, preconditions, duration, timer,
started, ended, reportLogo, logoPath, type
```
and calls `$electronService.exportSession(data)` via IPC, which dispatches to `FileSystemUtility.exportSession()` in the main process.

## PDF Export

PDF generation works through a dedicated hidden `BrowserWindow`. The flow:

1. `FileSystemUtility.exportSession()` creates a new off-screen `BrowserWindow` that loads the `/print` route
2. The `ACTIVE_PDF` IPC event is sent to this window with the session metadata
3. The `/print` route renders `PrintView.vue`, which:
   - Calls `window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, { func: GET_ITEMS })` to load the session items
   - Calls `window.ipc.invoke(IPC_HANDLERS.SYSTEMINFO, { func: GET_SYSTEM_INFO })` to load environment data
   - Renders the full session as a two-column layout: left column (8 columns wide) is the evidence timeline; right column (4 columns wide) is session metadata and environment
4. Electron's `webContents.printToPDF()` captures the rendered HTML as a PDF
5. The PDF is written to the filesystem and the save dialog is shown to the tester

### PDF Content

**Left column — Summary block:**
- Note type counts (e.g., "Comment: 3, Problem: 1, Idea: 2")
- Tag counts aggregated across all items
- Emoji reaction counts
- Follow-up item count

Below the summary block, a vertical timeline lists every captured item in chronological order. Each timeline entry shows:
- A clock icon with the HH:MM:SS timestamp at which the item was captured
- The item's filename (for media items)
- The item content (image inline, video poster with play icon overlay, audio waveform placeholder, note text, mind map image)
- The annotation: note type icon, type label, and rich-text comment

The timeline begins with a "play" icon at 00:00:00 and ends with a "stop" icon at the final elapsed time.

**Right column — Session details:**
- Title
- Charter (HTML content)
- Preconditions (HTML content)
- Configured time (duration)
- Session elapsed time (timer)

**Right column — Environment snapshot** (populated via `SystemInfoUtility`):
- OS (Mac OS / Windows / Linux / iOS / Android — detected from `navigator.userAgent` and `navigator.platform`)
- Screen resolution (screen.width × screen.height)
- Current date/time (UTC)
- Computer hostname
- OS distribution, release, architecture
- System manufacturer and model
- BIOS version
- Processor name, core count, speed
- Total RAM

If `config.logo.enabled` is true, the report header includes the logo image from `config.logo.path`.

## ZIP Export

The ZIP format packages the session directory into a single `.zip` file using the `adm-zip` library (via `FileSystemUtility.exportSession()`). The archive contains:
- All captured media files (PNG screenshots, MP4 videos, MP3 audio, uploaded files)
- The session JSON data file (items, case metadata, session metadata)
- Any mind map images

The tester is prompted to choose a save location via the native file save dialog.

## Session Items in the Review Interface

The workspace `WorkspaceWrapper` component displays all session items in a scrollable list. Each item can be:

- **Viewed** — images open in the image editor (`tui-image-editor`), videos play inline, audio shows a waveform via `wavesurfer.js`, notes show their rich text
- **Edited** — clicking an item opens the item edit dialog where the tester can update the annotation type, text, tags, emoji, and follow-up status
- **Deleted** — selected items can be bulk-deleted via the delete control
- **Reordered** — items can be dragged to change their order (`vuedraggable`)

The `TimelineWrapper` component provides an alternative chronological view.

## Session Save (Mid-Session)

Sessions can be saved to disk at any point during the session. This is distinct from session end — saving preserves the current state so the tester can resume later or safely start a new session. Save is triggered by:

- The native File menu "Save Session" item
- The `SaveConfirmDialog` which the app shows automatically in some flows

`saveSession()` in `ControlPanel` collects full case and session state from the store and calls `$storageService.saveSession(data)` which routes to `FileSystemUtility.saveSession()` in the main process.

## Session Sharing (TestFiesta)

The `ShareSessionDialog` is triggered from the control panel's dropdown menu. When opened, it calls `testfiestaIntegrationHelper.saveSession(credentials)` to push the current session to TestFiesta and returns a shareable link. This feature is only available when `config.localOnly` is false. The `isShareSessionAllowed` computed property in `ControlPanel` gates its visibility.

## Logo Customization

The reports tab in Settings (`ReportsTab`) lets the tester configure a custom logo for PDF reports. The logo path is stored in `config.logo.path` and the enabled flag in `config.logo.enabled`. When enabled, the logo appears at the top of the PDF report (max width 200px).
