const { join } = require("path");

let configDir, currentVersion;

try {
  const { app, remote } = require("electron");
  configDir = (app || remote.app).getPath("userData");
  currentVersion = app.getVersion();
} catch (error) {
  const os = require('os');
  const path = require('path');
  configDir = path.join(os.homedir(), '.pinata');
  currentVersion = "1.0.0"; // Default version
}

const defaultMeta = {
  configPath: join(configDir, "config.json"),
  credentialsPath: join(configDir, "credentials.json"),
  sessionPath: join(configDir, "sessions"),
  sessionDataPath: "",
  version: currentVersion,
};

const defaultConfig = {
  localOnly: false,
  theme: "light",
  defaultColor: "#1976D2FF",
  commentType: "Comment",
  audioCapture: false,
  videoQuality: "high",
  debugMode: false,
  summaryRequired: false,
  ai: {
    enabled: false,
  },
  defaultTags: [],
  templates: {
    image: {
      content: "",
      text: "",
    },
    video: {
      content: "",
      text: "",
    },
    audio: {
      content: "",
      text: "",
    },
    text: {
      content: "",
      text: "",
    },
    file: {
      content: "",
      text: "",
    },
    mindmap: {
      content: "",
      text: "",
    },
  },
  checklist: {
    presession: {
      tasks: [],
      status: false,
    },
    postsession: {
      tasks: [],
      status: false,
    },
  },
  hotkeys: {
    general: {
      cancel: ["ctrl", "c"],
      save: ["ctrl", "s"],
    },
    home: {
      quickTest: ["ctrl", "q"],
      newExploratorySession: ["ctrl", "e"],
      openExploratorySession: ["ctrl", "o"],
    },
    sessionPlanning: {
      title: ["ctrl", "t"],
      charter: ["ctrl", "h"],
      timeLimit: ["ctrl", "l"],
      preconditions: ["ctrl", "p"],
      checklist: ["ctrl", "e"],
      start: "general.save",
    },
    workspace: {
      pause: ["ctrl", "p"],
      resume: "workspace.pause",
      stop: ["ctrl", "h"],
      videoStart: ["ctrl", "v"],
      videoStop: "workspace.videoStart",
      screenshot: ["ctrl", "r"],
      audioStart: ["ctrl", "a"],
      audioStop: "workspace.audioStart",
      note: ["ctrl", "n"],
      mindmap: ["ctrl", "m"],
      changeSource: ["ctrl", "o"],
      createIssue: ["ctrl", "i"],
      back: ["ctrl", "b"],
      copy: ["alt", "c"],
      paste: ["alt", "v"],
      edit: ["alt", "e"],
      delete: ["del"],
    },
    evidence: {
      name: ["ctrl", "n"],
      followUp: ["ctrl", "f"],
      comment: ["ctrl", "d"],
      tags: ["ctrl", "t"],
      type: ["ctrl", "y"],
      save: "general.save",
      cancel: "general.cancel",
    },
  },
  version: currentVersion,
  logo: {
    enabled: false,
    path: "",
    name: "",
    size: 0,
  },
  cache: {
    retentionPeriod: 7,
  },
  colors: {
    shapeColor: "#101828",
    markerColor: "#101828",
    connectorColor: "#101828",
    textColor: "#101828",
  },
};

const recursivelyMerge = (oldConfig, newConfig) => {
  if (!(oldConfig instanceof Object) || Array.isArray(oldConfig)) {
    if (!oldConfig || oldConfig.constructor !== newConfig.constructor) {
      return newConfig;
    }
    return oldConfig;
  }
  if (!(newConfig instanceof Object) || Array.isArray(newConfig)) {
    return newConfig;
  }

  let builtConfig = {};
  for (const key of Object.keys(newConfig)) {
    builtConfig[key] = recursivelyMerge(
      oldConfig[key],
      newConfig[key],
      `path.${key}`
    );
  }
  for (const key of Object.keys(oldConfig)) {
    if (!Object.keys(newConfig).includes(key)) {
      builtConfig[key] = oldConfig[key];
    }
  }
  return builtConfig;
};

module.exports = {
  defaultMeta,
  defaultConfig,
  recursivelyMerge
};
