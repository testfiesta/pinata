<!-- spec-meta last-updated-sha: HEAD last-updated-pr: null last-updated-date: 2026-02-20 spec-version: 1.0 -->

# Feature Spec: TestFiesta Integration

## Overview

Pinata is the companion desktop client for the TestFiesta test management platform. When a tester signs in with a TestFiesta account, they can push sessions and evidence to TestFiesta. All session data is always stored locally first; pushing to TestFiesta is an explicit, opt-in action.

## API Endpoint

All TestFiesta API calls go to `https://api.testfiesta.com/v1` (configured via `VUE_APP_TESTFIESTA_API_URL` in `.env.production`). The integration is implemented in `src/integrations/TestfiestaIntegrationHelpers.js`.

## Authentication

TestFiesta credentials are stored in the credentials file under the `testfiesta` key. A credential entry contains:

```json
{
  "accessToken": "<token>",
  "expiresAt": "<iso-datetime>",
  "type": "bearer",
  "loggedInAt": "2026-02-20 12:00:00",
  "oauthTokenIds": [...],
  "user": {
    "id": "<uuid>",
    "email": "tester@example.com",
    "name": "Jane Tester",
    "avatar": "<url>",
    "locale": "en",
    "verified": true
  },
  "orgs": [...]
}
```

The `type` field is `"bearer"`. API requests include `Authorization: Bearer <accessToken>`.

The sign-in route is `/authentication/signinTestfiesta` which renders `SigninTestfiestaWrapper`. On first use without existing credentials, the integration helper calls `GET /app/signup/token` to auto-create an anonymous token.

## Session Push Flow

The primary push action is `saveSession(credentials)` in `TestfiestaIntegrationHelpers.js`. It is called when the tester uses the "Share Session" feature from the control panel dropdown.

**Step 1 — Auto-provision if needed.** If no TestFiesta credentials exist, `GET /app/signup/token` is called to get a guest token. The resulting credential is saved locally.

**Step 2 — Read state.** The full session state (case + session items, including all evidence metadata) is read from the persistence layer via IPC: `window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, { func: GET_STATE })`.

**Step 3 — POST to TestFiesta.** `PATCH /pinata/executions` is called with the full state object. The response contains:
- A `link` field — a shareable URL for the session on testfiesta.com
- A `steps` array — each step corresponds to a session evidence item and may include an `uploadURL` (pre-signed S3 URL for media files)

**Step 4 — Upload media files.** For each step that has an `uploadURL`, the corresponding local file is fetched via `fetch("file://...")`, wrapped in a `File` object, and uploaded via `PUT <uploadURL>` with the appropriate `Content-Type` and `X-Upload-Content-Length` headers.

**Step 5 — Return link.** The shareable link is returned to the caller (`ControlPanel.showShareSessionDialog`) and displayed in `ShareSessionDialog`.

## Session ID Tracking

When a new session is created, `FileSystemUtility.createNewSession()` generates a `caseID` and `sessionID` on disk. These IDs are committed to the Vuex store (`setCaseID`, `setSessionID`). They serve as local identifiers; the TestFiesta server assigns its own IDs when the session is pushed.

## Credential Storage

Credentials are persisted via `PersistenceUtility.updateCredentials()` which writes to the local credentials file. Multiple TestFiesta accounts can be stored (the array allows for this). When deduplicating, the `user.id` field is used to match an existing credential entry.

## Field Mappings: Session State to TestFiesta Payload

The full `state` object sent to `PATCH /pinata/executions` is whatever `persistenceUtility.getState()` returns. This includes:

**Case fields:**
- `caseID` — local identifier
- `title` — test charter title
- `charter` — rich text charter content
- `preconditions` — rich text preconditions
- `duration` — configured time budget (seconds)
- `mindmap` — charter mind map structure

**Session fields:**
- `sessionID` — local identifier
- `status` — session lifecycle state
- `timer` — elapsed time in seconds
- `started` — ISO timestamp of session start
- `ended` — ISO timestamp of session end
- `quickTest` — boolean

**Items (steps):** Each item in `session.items` becomes a step in the execution. Items include:
- `stepID` — used as `external_id` to match server-side upload URLs
- `fileType` — MIME type of the evidence
- `filePath` — local path (used for file upload)
- `fileSize` — used as `X-Upload-Content-Length` header
- `comment` — annotation object (`type`, `text`)
- `tags`, `emoji`, `followUp`
- `timer_mark` — timestamp within session

## localOnly Mode

When `config.localOnly` is true, the "Share Session" option is hidden in the control panel (`isShareSessionAllowed` computed property returns false). This allows organizations to run Pinata without any outbound calls to TestFiesta.

## Share Session Dialog

`ShareSessionDialog` displays the generated TestFiesta link after a successful push. The tester can copy the link or open it in the browser. This dialog also has access to `credentialItems` and `configItem` for displaying connection context.

## Authentication Routes

The following routes under `/authentication` handle TestFiesta-related auth flows:

| Route | Component | Purpose |
|---|---|---|
| `/authentication/signupMain` | SignupMainWrapper | First-time signup entry point |
| `/authentication/signupPinata` | SignupPinataWrapper | Pinata-specific signup |
| `/authentication/signin` | SigninWrapper | General sign-in |
| `/authentication/signinTestfiesta` | SigninTestfiestaWrapper | TestFiesta account sign-in |
