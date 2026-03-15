<!-- spec-meta last-updated-sha: HEAD last-updated-pr: null last-updated-date: 2026-02-20 spec-version: 1.0 -->

# Pinata — Spec Overview

## What Is Pinata?

Pinata is an open-source desktop application for exploratory software testing. It runs as a native Electron app on macOS, Windows, and Linux. During an exploratory test session, testers capture evidence (screenshots, screen recordings, audio recordings, notes, file uploads, and mind maps), annotate each piece of evidence with a comment type and free-form text, and then export or push the resulting session to downstream systems.

The app is published by TestFiesta, Inc. under the GPLv3 license. Its app ID is `com.testfiesta.pinata`.

## Key Use Cases

**Guided exploratory sessions.** A tester creates a test charter — a title, a free-text charter description, preconditions, and an optional time budget — before starting a session. The charter keeps the session focused while still leaving room for spontaneous discovery.

**Quick tests.** A lightweight mode (called "quick test") that skips charter setup. The tester goes straight to the workspace and starts capturing evidence.

**Evidence capture during testing.** While a session is running, the tester can at any time take a screenshot of any open window, record a segment of video from any screen or window, record audio from any connected microphone, attach any file from the filesystem, or create a mind map node. Every captured item is timestamped with the number of seconds elapsed in the session.

**Annotating evidence.** Each captured item is immediately followed by an annotation dialog. The tester chooses a note type (Comment, Problem, Suggestion, Idea, Question, Concern, or Positive), writes free-form rich text, adds tags, adds emoji reactions, and marks items for follow-up.

**Session review and reporting.** After a session ends, all evidence and annotations are displayed in a chronological timeline. The tester can edit items, re-order them, and export the session as a ZIP archive or a PDF report. The PDF includes session metadata, an environment snapshot, and the full timeline.

**Pushing sessions to TestFiesta.** When signed into a TestFiesta account, the tester can push individual evidence items (or the full session) as test executions or defects to a TestFiesta project.

**Creating defects in Jira.** Individual evidence items can be sent directly to one or more configured Jira instances as new issues. Jira connection uses OAuth 2.0 with PKCE.

**Exporting to Xray.** Session evidence can be exported to Atlassian Xray (Jira-based test management) as test executions.

**Exporting to Zephyr.** Zephyr Squad and Zephyr Scale connections exist in the codebase and UI but are currently hidden behind feature flags (`false` conditions in `ExportPanel.vue`) and are not exposed in production.

## How Pinata Connects to TestFiesta

Pinata communicates with the TestFiesta REST API at `https://api.testfiesta.com/v1`. A tester authenticates by signing in through an authentication flow (`/authentication/signinTestfiesta`) which stores credentials locally. Once authenticated, the tester can:

- Save a session to TestFiesta (used when sharing a session link)
- Push individual evidence items to TestFiesta as test case steps, executions, or defects

The integration is implemented in `src/integrations/TestfiestaIntegrationHelpers.js` and called from the `ControlPanel` and `ExportPanel` components.

When running as a desktop app, Pinata stores all session data locally in a file-based JSON database (`simple-json-db`). The TestFiesta connection is additive — the local session always exists first, and pushing to TestFiesta is an explicit tester action.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 13 |
| Renderer framework | Vue 2.6 with Vue Router 3 and Vuex 3 |
| UI component library | Vuetify 2 |
| Rich text editing | @yatt-ai/vuetify-tiptap (TipTap-based) |
| Local persistence | simple-json-db (JSON file on disk) |
| Screen/window capture | Electron `desktopCapturer` + Web MediaRecorder API |
| Video processing | fluent-ffmpeg with ffmpeg-static and ffprobe-static |
| Mind maps | D3 v5 force-directed graph |
| Image editing | tui-image-editor |
| Audio waveform display | wavesurfer.js 6 |
| HTTP client | axios |
| Build tooling | vue-cli-service + vue-cli-plugin-electron-builder |
| Packaging | electron-builder (DMG for macOS, NSIS for Windows, AppImage for Linux) |
| Code signing | electron-builder-notarize (macOS), custom sign script (Windows) |
| Internationalization | vue-i18n 8 |
| Testing | Jest + @vue/test-utils |

## Spec Index

- `features/session-recording.md` — Session lifecycle: charter setup, start, pause, resume, end
- `features/evidence-capture.md` — Screenshot, video, audio, file upload, mind map, annotation
- `features/reporting.md` — Session review, timeline, PDF export, ZIP export
- `features/testfiesta-integration.md` — TestFiesta account connection and session/defect push
- `features/integrations.md` — Jira OAuth, Xray, Zephyr Squad, Zephyr Scale, OpenAI
- `architecture/overview.md` — Electron main/renderer split, IPC, local storage, local server
- `development/setup.md` — Dev setup, build commands, packaging
