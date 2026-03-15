<!-- spec-meta last-updated-sha: HEAD last-updated-pr: null last-updated-date: 2026-02-20 spec-version: 1.0 -->

# Feature Spec: Evidence Capture

## Overview

Evidence is the core output of a Pinata session. Every piece of captured evidence is a session "item" — a record that has a unique `stepID` (UUID v4), a `fileType`, a `timer_mark` (seconds elapsed at capture time), a `comment` object, and optional metadata (tags, emoji, followUp flag). Items are stored in Vuex state (`$store.state.session.items`) during a session and persisted to disk via the persistence layer.

Capture buttons are all disabled while the session is paused (`status === 'pause'`).

## Evidence Item Schema

```json
{
  "stepID": "<uuid>",
  "fileType": "image/png | video/mp4 | audio/mp3 | text/plain | application/json | ...",
  "fileName": "screenshot-abc12.png",
  "filePath": "/path/on/disk/to/file",
  "comment": {
    "type": "Comment | Problem | Suggestion | Idea | Question | Concern | Positive | Summary",
    "text": "<html rich text>"
  },
  "tags": [{ "text": "tag-name" }],
  "emoji": [{ "data": "😀" }],
  "followUp": false,
  "timer_mark": 142,
  "createdAt": 1700000000000,
  "color": "#e2e7fe"
}
```

For media items (images, videos, audio): `fileName` and `filePath` reference the file written to disk by `CaptureUtility`. For video items, a `poster` field holds the path to a thumbnail image captured at the start of recording. For mind maps, `filePath` is empty during editing and populated when the map is saved as a PNG.

## Note Type Classification

Every evidence item carries a `comment.type`. The available types are defined in `TEXT_TYPES` in `constants.js`:

| Type | Icon | Color |
|---|---|---|
| Comment | fa-comment | Blue (#0C2FF3) |
| Problem | fa-triangle-exclamation | Red (#DC3545) |
| Suggestion | fa-clipboard | Blue (#007BFF) |
| Idea | fa-lightbulb | Amber (#FFC107) |
| Question | fa-circle-question | Cyan (#17A2B8) |
| Concern | fa-bookmark | Orange (#FAA24b) |
| Positive | fa-plus | Green (#28A745) |
| Summary | fa-table-list | Gray (#AAAAAA) — used only for the session-closing summary |

The tester selects a type when annotating each captured item.

## Screenshot Capture

**Trigger:** Click the camera button in `ControlPanel`, or press the configured screenshot hotkey (`workspace.screenshot`).

**Target selection:** If `session.isTargetForAll` is false, `ChangeSourceTargetDialog` appears first so the tester can pick which window to capture. If `isTargetForAll` is true, the previously selected session source is used directly.

**Capture process (`screenshotProcess`):**

In Electron:
1. `navigator.mediaDevices.getUserMedia()` is called with `chromeMediaSource: "desktop"` and `chromeMediaSourceId: sourceId`, requesting a video stream at 1280–10000 × 720–4000 px resolution
2. A hidden `<video>` element is created, the stream is assigned as its source, and `onloadedmetadata` fires once the video is ready
3. A `<canvas>` is created matching the video dimensions, and `ctx.drawImage(video, ...)` renders one frame
4. The canvas is exported as a PNG data URL via `canvas.toDataURL("image/png")`
5. `$electronService.createImage(imgURI)` is called via IPC, which passes the data URL to `CaptureUtility.createImage()` in the main process. This writes the PNG to the current session's directory and returns `{ status, message, item }` where `item` contains `fileName`, `filePath`, and `fileType`

In web mode:
1. The existing `mediaStream` (from `navigator.mediaDevices.getDisplayMedia`) is cloned
2. The same canvas capture is performed
3. `createImageForWeb(imgURI)` (in `WebHelpers.js`) handles storage in the browser context

**Annotation:** After the image is saved, `AddEvidenceDialog` opens with `evidenceData = { ...item, timer_mark: this.timer }`. The tester writes an annotation, selects a type, adds tags/emoji, and submits.

## Screen Recording (Video)

**Trigger:** Click the video camera button to start, click again (highlighted blue while active) to stop. Hotkeys: `workspace.videoStart` / `workspace.videoStop`.

**Target selection:** Same `ChangeSourceTargetDialog` flow as screenshots when `isTargetForAll` is false.

**Recording process (`videoRecordProcess`):**

1. Reads `config.videoQuality` from store. Quality maps to resolution via `VIDEO_RESOLUTION`:
   - `high`: 1920×1080
   - `standard`: 1024×768
   - `low`: 640×480

2. In Electron: `navigator.mediaDevices.getUserMedia()` is called with `chromeMediaSource: "desktop"`, the chosen source ID, and the configured resolution constraints. Frame rate is set to 30 fps via `applyConstraints({ frameRate: 30 })`

3. If `config.audioCapture` is enabled and audio input devices are available, an `AudioContext` is used to mix in the microphone audio. The audio track is added to the video stream before recording starts

4. A `MediaRecorder` is created. MIME type preference is `video/webm; codecs=vp9`, falling back to `video/webm`. Recording is started with 1-second chunks (`mediaRecorder.start(1000)`)

5. At `onstart`: a poster image (first frame) is captured using the same canvas technique as screenshots. The poster path is stored for later reference

6. Frames accumulate in `ondataavailable`. At `onstop`: all frames are assembled into a `Blob`, converted to an `ArrayBuffer`, and sent to `$electronService.createVideo(buffer)` via IPC. `CaptureUtility.createVideo()` writes the `.mp4` file to disk and returns the item metadata

7. `AddEvidenceDialog` opens with the video item and its poster path

## Audio Recording

**Trigger:** Microphone button to start/stop. Hotkeys: `workspace.audioStart` / `workspace.audioStop`.

**Process:**

1. `navigator.mediaDevices.enumerateDevices()` is called to find available audio input devices. Devices with `deviceId === "communications"` or `deviceId === "default"` are filtered out to avoid feedback loops
2. If no audio devices are found, `AudioErrorDialog` is shown
3. Otherwise, `navigator.mediaDevices.getUserMedia()` is called with `{ audio: { deviceId: ..., autoGainControl: false, latency: 0.0 } }`
4. `MediaRecorder` records in `audio/webm` format with 1-second chunks
5. At stop: the blob is collected, converted to an ArrayBuffer, and sent to `$electronService.createAudio(buffer)` via IPC. `CaptureUtility.createAudio()` writes the `.mp3` file to disk
6. `AddEvidenceDialog` opens (poster is empty string for audio items)

## File Upload (Evidence Upload)

**Trigger:** The "upload evidence" (paperclip) button in `ControlPanel`.

In Electron: `$electronService.uploadEvidence()` triggers a native file picker dialog via `CaptureUtility.uploadEvidence()`. The selected file is copied into the session directory. The returned item has the file's original name and new path.

In web mode: `uploadEvidenceForWeb()` from `WebHelpers.js` handles the browser's file input.

After either path: `AddEvidenceDialog` opens with the file item. Supported types include all `FILE_TYPES` entries: images (PNG, JPEG, BMP, GIF, SVG, WebP), videos (MP4, MPEG, WebM, AVI), audio (MP3, MPEG, WAV, WebM), and JSON (treated as mind map format).

Files can also be added by drag-and-drop. The `dropFile` IPC function in `CaptureUtility` handles this path.

## Mind Map Capture

**Trigger:** The mind map button in `ControlPanel`, or hotkey `workspace.mindmap`.

**Process:**

1. `addMindmap()` creates a mind map item with `fileType: "application/json"` and an initial `content` object containing `DEFAULT_MAP_NODES` and `DEFAULT_MAP_CONNECTIONS` (a pre-built two-node D3 graph)
2. `AddEvidenceDialog` opens immediately with this item
3. Within the dialog, the mind map is rendered and edited inline using the D3-based `MindmapEditor` component. The tester can add nodes, connect them, label them, and assign statuses (Passed, Failed, In Progress)
4. When the tester saves, the map is rendered to a PNG using `dom-to-image-more` and stored on disk. The `filePath` is updated with the saved PNG path

## Text Notes

**Trigger:** Notification/note button in `ControlPanel`, or hotkey `workspace.note`.

**Process:**

1. `showNoteDialog()` opens `NoteDialog`. The dialog contains a TipTap rich text editor and fields for note type, tags, emoji, and a "follow up" toggle
2. On submit, `addNote(data)` is called in `ControlPanel`:
   - Creates a new item with `fileType: "text/plain"`, the comment data, and `timer_mark`
   - The item is also added to the mind map node list (for the workspace mind map overlay). Position is calculated with random offsets from the last node to avoid overlap
   - Connections are added from the previously selected nodes (or the last node) to the new one
3. The note item is committed to the store and the mind map is re-rendered

## The AddEvidenceDialog

`AddEvidenceDialog` is the common annotation interface that appears after every capture action. It receives the captured item as `itemData` and gives the tester:

- A preview of the captured content (image thumbnail, video with poster, audio waveform, file icon, or mind map thumbnail)
- A `comment.type` selector (Comment, Problem, Suggestion, Idea, Question, Concern, Positive)
- A TipTap rich text field for the annotation text
- A tag input (`@johmun/vue-tags-input`) for tagging the item
- An emoji picker (`v-emoji-picker`) for reactions
- A "follow up" toggle
- Integration-specific sub-components for pushing the item directly to Jira, TestRail, or TestFiesta (shown based on configured credentials)

On submit, the completed item is added to `$store.state.session.items` via `addItem`.

## Session Mind Map (Workspace Overlay)

Separate from the charter mind map, the workspace view shows a live D3 force-directed graph that grows as notes are added during the session. Each text note becomes a node. Connections are drawn from the previously selected nodes to the new one. The tester can select nodes before adding a note to explicitly control connection targets. The workspace mind map is for visual navigation of the session's notes; it is separate from the stand-alone mind map capture type.

## Item Tags and Metadata

Tags are freeform strings added to individual items. The PDF report aggregates tag usage counts across all items. Emoji reactions are similarly aggregated. The "follow up" flag counts items that need further investigation; this count also appears in the PDF report summary.
