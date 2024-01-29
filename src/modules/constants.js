export const IPC_HANDLERS = {
  BROWSER: "browser",
  CAPTURE: "capture",
  PERSISTENCE: "persistence",
  FILE_SYSTEM: "fileSystem",
  STORE: "store",
  MENU: "menu",
  WINDOW: "window",
  SERVER: "server",
};

export const IPC_FUNCTIONS = {
  GET_MEDIA_SOURCE: "getMediaSource",
  SAVE_NOTE: "saveNote",
  CREATE_IMAGE: "createImage",
  UPDATE_IMAGE: "updateImage",
  CREATE_VIDEO: "createVideo",
  UPDATE_VIDEO: "updateVideo",
  DELETE_FILE: "deleteFile",
  UPLOAD_EVIDENCE: "uploadEvidence",
  CREATE_AUDIO: "createAudio",
  UPDATE_AUDIO: "updateAudio",
  OPTIMIZE_VIDEO: "optimizeVideo",
  DROP_FILE: "dropFile",

  SET_DEV_MODE: "setDevMode",
  OPEN_ADD_WINDOW: "openAddWindow",
  CLOSE_ADD_WINDOW: "closeAddWindow",
  OPEN_EDIT_WINDOW: "openEditWindow",
  CLOSE_EDIT_WINDOW: "closeEditWindow",
  OPEN_SETTING_WINDOW: "openSettingWindow",
  CLOSE_SETTING_WINDOW: "closeSettingWindow",
  OPEN_MINIMIZE_WINDOW: "openMinimizeWindow",
  CLOSE_MINIMIZE_WINDOW: "closeMinimizeWindow",
  CLOSE_SESSION_AND_MINIIMIZED_WINDOW: "closeSessionAndMinimizedWindow",
  OPEN_MODAL_WINDOW: "openModalWindow",
  CLOSE_MODAL_WINDOW: "closeModalWindow",
  SET_WINDOW_SIZE: "setWindowSize",
  SET_APPEARANCE: "setAppearance",
  OPEN_NOTES_WINDOW: "openNotesWindow",
  CLOSE_NOTES_WINDOW: "closeNotesWindow",
  MOVE_WINDOW: "moveWindow",

  INITIALIZE_SESSION: "initializeSession",
  GET_CURRENT_SESSION: "getCurrentSession",
  GET_SESSION_ID: "getSessionID",
  GET_CASE_ID: "getCaseID",
  GET_STATE: "getState",
  UPDATE_STATE: "updateState",
  ADD_ITEM: "addItem",
  GET_ITEMS: "getItems",
  UPDATE_ITEM: "updateItem",
  UPDATE_ITEMS: "updateItems",
  DELETE_ITEMS: "deleteItems",
  GET_ITEM_BY_ID: "getItemById",
  GET_CONFIG: "getConfig",
  UPDATE_CONFIG: "updateConfig",
  GET_CREDENTIALS: "getCredentials",
  UPDATE_CREDENTIALS: "updateCredentials",
  GET_METADATA: "getMetadata",
  UPDATE_METADATA: "updateMetadata",

  GET_NOTES: "getNotes",
  UPDATE_NOTES: "updateNotes",
  RESET_DATA: "resetData",

  EXPORT_ITEMS: "exportItems",
  CREATE_NEW_SESSION: "createNewSession",
  SAVE_SESSION: "saveSession",
  OPEN_SESSION: "openSession",
  EXPORT_SESSION: "exportSession",
  OPEN_CONFIG_FILE: "openConfigFile",
  OPEN_CREDENTIALS_FILE: "openCredentialsFile",
  DRAG_ITEM: "dragItem",
  OPEN_EXTERNAL_LINK: "openExternalLink",

  CHANGE_MENUITEM_STATUS: "changeMenuItemStatus",

  START_SERVER: "startServer",
  STOP_SERVER: "stopServer",
};

export const IPC_BIND_KEYS = {
  CLOSED_NOTE_DIALOG: "note_dialog_closed",
  CLOSED_SUMMARY_DIALOG: "summary_dialog_closed",
  MODAL_DATA: "modal_data",
  END_SESSION: "end_session",
  CLOSED_MINIMIZE_WINDOW: "minimize_window_closed",
  CLOSED_ENDSESSION_DIALOG: "endsession_dialog_closed",
  CLOSED_SOURCEPICKER_DIALOG: "sourcepicker_dialog_closed",
  CLOSED_SHARE_OAUTH_DIALOG: "share_oauth_dialog_closed",
  CLOSED_KEY_CAPTURE_DIALOG: "key_capture_dialog_closed",
};

export const STATUSES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
};

export const SESSION_STATUSES = {
  PENDING: "pending",
  START: "start",
  PAUSE: "pause",
  RESUME: "resume",
  PROCEED: "proceed",
  END: "end",
};

export const HOTKEY_PAGES = [
  "general",
  "home",
  "sessionPlanning",
  "workspace",
  "evidence",
];

export const VIEW_MODE = {
  NORMAL: "normal",
  MINI: "minimized",
};

export const TEXT_TYPES = {
  Comment: {
    icon: "fa-solid fa-comment",
    fill: "#6D28D9",
  },
  Problem: {
    icon: "fa-solid fa-triangle-exclamation",
    fill: "#DC3545",
  },
  Suggestion: {
    icon: "fa-solid fa-clipboard",
    fill: "#007BFF",
  },
  Idea: {
    icon: "fa-solid fa-lightbulb",
    fill: "#FFC107",
  },
  Question: {
    icon: "fa-solid fa-circle-question",
    fill: "#17A2B8",
  },
  Concern: {
    icon: "fa-solid fa-bookmark",
    fill: "#FAA24b",
  },
  Positive: {
    icon: "fa-solid fa-plus",
    fill: "#28A745",
  },
  Summary: {
    icon: "fa-solid fa-table-list",
    fill: "#AAAAAA",
  },
};

export const VIDEO_RESOLUTION = [
  {
    type: "high",
    width: 1920,
    height: 1080,
  },
  {
    type: "standard",
    width: 1024,
    height: 768,
  },
  {
    type: "low",
    width: 640,
    height: 480,
  },
];

export const DEFAULT_CHARTER_MAP_NODES = [
  {
    id: "5e274797-4db7-4fe8-a983-8b8abf8771c5",
    text: "System Under Test",
    url: "https://features.yattie.ai",
    fx: -210.9125181819311,
    fy: -583.1010883631283,
  },
  {
    id: "4763495c-62b7-4625-9083-2d40045b6550",
    text: "Feature #1",
    fx: 99.1983655368465,
    fy: -582.6407249084972,
  },
];

export const DEFAULT_CHARTER_MAP_CONNECTIONS = [
  {
    source: "5e274797-4db7-4fe8-a983-8b8abf8771c5",
    target: "4763495c-62b7-4625-9083-2d40045b6550",
  },
];

export const DEFAULT_MAP_NODES = [
  {
    id: "5e274797-4db7-4fe8-a983-8b8abf8771c5",
    text: "Mind Map",
    url: "https://features.yattie.ai",
    fx: -210.9125181819311,
    fy: -583.1010883631283,
  },
  {
    id: "4763495c-62b7-4625-9083-2d40045b6550",
    text: "First Node",
    fx: 99.1983655368465,
    fy: -582.6407249084972,
  },
];

export const DEFAULT_MAP_CONNECTIONS = [
  {
    source: "5e274797-4db7-4fe8-a983-8b8abf8771c5",
    target: "4763495c-62b7-4625-9083-2d40045b6550",
  },
];

export const AI_ENABLED_FIELDS = {
  title: {
    type: "textField",
    callback: "updateTitle",
  },
  charter: {
    type: "textArea",
    callback: "updateCharter",
  },
  preconditions: {
    type: "textArea",
    callback: "updatePreconditions",
  },
  comment: {
    type: "textArea",
    callback: "updateComment",
  },
};

export const DEFAULT_OPENAI_CONFIGS = {
  model: "gpt-3.5-turbo-0613",
  temperature: 1.35,
  prompts: {
    title: [
      {
        role: "system",
        content:
          "You are an assistant helping users write Test Charter titles for exploratory tests.",
      },
      {
        role: "system",
        content:
          "The user will provide you a title or some related words and you should respond with a new title that improves clarity, fix spelling mistakes, and fix grammar mistakes.",
      },
    ],
    charter: [
      {
        role: "system",
        content:
          "You are an assistant helping users write Test Charters for exploratory tests.",
      },
      {
        role: "system",
        content:
          "The user will provide you an HTML document with a test charter or ideas for a test scenario and your response should improve the clarity, fix spelling mistakes, and fix grammar mistakes of what they have written.",
      },
      {
        role: "system",
        content:
          "You must respond with valid HTML and retain as much of the original formatting as possible.",
      },
    ],
    preconditions: [
      {
        role: "system",
        content:
          "You are an assistant helping users write Test Charters for exploratory tests.",
      },
      {
        role: "system",
        content:
          "The user will provide you an HTML document with preconditions for their test scenario and your response should improve the clarity, fix spelling mistakes, and fix grammar mistakes of what they have written.",
      },
      {
        role: "system",
        content:
          "You must respond with valid HTML and retain as much of the original formatting as possible.",
      },
    ],
    comment: [
      {
        role: "system",
        content:
          "The user will provide you an HTML document with a comment describing some evidence they have collected and your response should improve the clarity, fix spelling mistakes, and fix grammar mistakes of what they have written.",
      },
      {
        role: "system",
        content:
          "You must respond with valid HTML and retain as much of the original formatting as possible.",
      },
    ],
  },
};
