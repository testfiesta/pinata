<!-- spec-meta last-updated-sha: HEAD last-updated-pr: null last-updated-date: 2026-02-20 spec-version: 1.0 -->

# Feature Spec: External Integrations

## Overview

Pinata supports connections to several third-party test management and issue tracking systems. All connections are configured in the Settings > Connections tab. Credentials are stored in the local credentials file and loaded into the `auth` Vuex module at startup. Multiple credentials for the same system can be stored simultaneously (e.g., two Jira instances).

Integration connection routes live under `/authentication/signin<System>` and render dedicated sign-in wrapper components.

---

## Jira

**File:** `src/integrations/JiraIntegrationHelpers.js`

**Connection methods:** Jira supports two authentication types:

- **Basic auth** — username + API token. Used for Jira Cloud (hosted by Atlassian) and self-hosted Jira Server/Data Center. The `accessToken` field is a Base64-encoded `user:token` string. The `type` field is `"basic"`.
- **OAuth 2.0 (PKCE)** — for Atlassian Cloud OAuth apps. The `type` field is `"oauth"`. Requires a client ID, client secret, and PKCE code challenge/verifier.

**OAuth flow** (in `server/modules/JiraUtility.js`):
1. The main process spawns a local Express server (`server/server.js`) on port 64064
2. The renderer calls `GET /oauth2/atlassian` on the local server, which builds the Atlassian OAuth 2.0 authorization URL using the configured `clientId`, `codeChallenge`, `scopes=WRITE`, and `redirectURL=http://localhost:64064/oauth2/atlassian/callback`
3. The URL is returned to the renderer, which opens it in the default browser
4. After the user authorizes, Atlassian redirects to the local callback endpoint
5. The callback exchanges the code for tokens via `POST` to Atlassian's token endpoint
6. Token data is normalized to camelCase and sent to the main process via `process.send({ type: "jira", data })`. The main process re-emits it to the renderer via `browserWindow.webContents.send("JIRA_LOGIN", data)`
7. The renderer receives the token data and saves it via `jiraIntegrationHelper.saveCredentials()`

**Stored credential shape:**
```json
{
  "accessToken": "<token>",
  "refreshToken": "<token>",
  "clientId": "...",
  "clientSecret": "...",
  "expiresAt": "...",
  "type": "oauth | basic",
  "loggedInAt": "...",
  "lastRefreshed": "...",
  "user": { "id", "email", "name", "avatar", "locale", "account_type", "verified" },
  "orgs": [{ "id", "url", "name", "avatar" }],
  "url": "<jira-host>"
}
```

**Token refresh detection:** Calls check if the OAuth token is older than 4 minutes (`dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute")`) when they receive a 401 or 403 response. When this condition is true, `returnResponse.error.checkAuth = true` is set, signaling the UI to prompt for re-authentication.

**API endpoints used:**

| Endpoint | URL pattern (basic) | Purpose |
|---|---|---|
| Project list | `GET /rest/api/3/project` | Fetch all projects for the credential |
| Issue search | `GET /rest/api/3/search?jql=...` | Search for existing issues |
| Project detail | `GET /rest/api/3/project/{id}` | Fetch a single project |
| Issue type metadata | `GET /rest/api/3/issue/createmeta?projectIds=...&issuetypeIds=...` | Fetch field schema for issue creation |
| Create issue | `POST /rest/api/3/issue` | Create a new Jira issue |
| Create attachment | `POST /rest/api/3/issue/{key}/attachments` | Attach media files to an issue |

For OAuth Cloud, the base URL is `https://api.atlassian.com/ex/jira/{orgId}/rest/api/3/`. For OAuth with a custom server URL or basic auth, it is `https://{url}/rest/api/3/` (or `/rest/api/2/` for server).

**Issue creation:** `createIssue(credential, issue, fieldMappings)` posts to the Jira issue create endpoint. Text fields with `fieldMappings[k].type === "text"` are converted from HTML to Atlassian Document Format (ADF) using the `@atlaskit/adf-utils` builders and an internal `htmlToADF()` function. The converter handles: paragraphs (`P`), headings (`H1`–`H3`), bold (`B`/`STRONG`), underline (`U`), italic (`EM`), blockquotes (`BLOCKQUOTE`), ordered and unordered lists (`OL`/`UL`/`LI`), links (`A`), colored spans (RGB converted to hex). The reporter field is auto-populated with the authenticated user's ID.

**Attachment upload:** Media files attached to the Jira issue are read from the local filesystem using `fetch("file:...")` and posted as multipart form data to the Jira attachment endpoint. The `X-Atlassian-Token: no-check` header is required by the Jira attachment API.

**UI entry points:**
- The control panel shows a bug icon button when `credentials.jira` is configured. Clicking it opens a dropdown listing available Jira instances (`JiraAddIssue` component)
- `AddEvidenceDialog` includes Jira as an option for pushing individual evidence items directly as issues
- Sign-in: `/authentication/signinJira` (`SigninJiraWrapper`)

**Jira OAuth Jira connection note:** The `User-Agent` header for all requests is set to `"PINATA"` by the main process request interceptor in `background.js`. This is required for Jira token integration to work correctly.

---

## TestRail

**File:** `src/integrations/TestRailIntegrationHelpers.js`

**Connection method:** Basic authentication (username + API key).

**Sign-in route:** `/authentication/signinTestRail` (`SigninTestRailWrapper`)

**Purpose:** Evidence items can be pushed to TestRail as test run results. The TestRail integration helpers provide methods for fetching projects, test runs, and creating test results with attachments.

**Current UI status:** TestRail is shown as a connected integration in the Connections tab. Export session to TestRail is commented out in `ExportPanel.vue` with a TODO comment asking "What does it look like to export an entire session to a 3rd party service?" Individual item push to TestRail via `AddEvidenceDialog` is the primary path.

---

## Xray

**File:** `src/integrations/XrayIntegrationHelpers.js`

**Connection method:** Basic auth (for Jira-hosted Xray) or API token.

**Sign-in route:** `/authentication/signinXray` (`SigninXrayWrapper`)

**Purpose:** Export a session or individual evidence items to Xray as test execution results. The `XrayExportSession` component in `ExportPanel` is visible when `credentials.xray` is configured and provides the "Export to Xray" option in the export dropdown. This is the only third-party export that is currently enabled in the production export panel (the others are commented out).

---

## Zephyr Squad

**File:** `src/integrations/ZephyrSquadIntegrationHelpers.js`

**Connection method:** API token (Zephyr Squad for Jira).

**Sign-in route:** `/authentication/signinZephyrSquad` (`SigninZephyrSquadWrapper`)

**Current UI status:** The Connections tab shows a Zephyr Squad sign-in button. The `ZephyrSquadExportSession` component exists and is registered in `ExportPanel`, but its display is gated with an explicit `false` condition in `ExportPanel.vue`:
```javascript
v-if="this.credentials.zephyrSquad && this.credentials.zephyrSquad.length > 0 && false"
```
This integration is not exposed to end users in the current codebase.

---

## Zephyr Scale

**File:** `src/integrations/ZephyrScaleIntegrationHelpers.js`

**Connection method:** API token (Zephyr Scale, formerly TM4J).

**Sign-in route:** `/authentication/signinZephyrScale` (`SigninZephyrScaleWrapper`)

**Current UI status:** Same as Zephyr Squad — the Connections tab shows a sign-in button, but the export option in `ExportPanel` is gated with a `false` condition and not shown to users.

---

## OpenAI (AI Assist)

**File:** `src/integrations/OpenAIIntegrationHelpers.js`

**Configuration:** Settings > Addons tab (`AddonsTab.vue`). The tester can enable AI assistance and enter an OpenAI API key. The key is stored in the config file.

**Model:** `gpt-3.5-turbo-0613` (configured in `DEFAULT_OPENAI_CONFIGS` in `constants.js`). Temperature is 1.35.

**AI-assisted fields** (`AI_ENABLED_FIELDS` in `constants.js`):
- `title` — improves clarity, fixes spelling and grammar of the test charter title
- `charter` — rewrites charter HTML content to improve clarity and grammar while preserving formatting
- `preconditions` — same as charter
- `comment` — improves annotation text for individual evidence items

**Integration surface:** When AI assist is enabled, a button appears next to each supported field. Clicking it sends the current field content to the OpenAI chat completions API and replaces the field with the improved text. For text fields, the model is prompted as an assistant helping write exploratory test content. For HTML fields, the model is instructed to return valid HTML while preserving formatting.

**Prompt system messages** are defined in `DEFAULT_OPENAI_CONFIGS.prompts`. There are separate prompt configurations for `title`, `charter`, `preconditions`, and `comment`.

---

## Credentials Storage

All credentials for all integrations are stored in a single credentials JSON file on the local filesystem, managed by `PersistenceUtility`. The file is structured as:

```json
{
  "testfiesta": [...],
  "jira": [...],
  "testrail": [...],
  "xray": [...],
  "zephyrSquad": [...],
  "zephyrScale": [...]
}
```

Each array can hold multiple accounts for that system. The credentials file path is shown in Settings > General and can be changed by the tester using the "Select File" button (which triggers a native file picker). This allows teams to share a credentials file across machines.

The `auth` Vuex module holds all credentials in memory during the session. The `auth/credentials` getter returns the full credentials object, which all integration components and helpers access.
