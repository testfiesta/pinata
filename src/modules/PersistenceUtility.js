import JSONdb from "simple-json-db";
import { app, remote } from "electron";
import { join, resolve } from "path";
import { existsSync, readdirSync, mkdirSync } from "fs";
import { getBrowserWindow } from "./BrowserWindowUtility";
import { STATUSES } from "./constants";
import { pathToFileURL } from "url";

const configDir = (app || remote.app).getPath("userData");
const jsonDbConfig = {
  jsonSpaces: 2,
};

const currentVersion = app.getVersion();

let metaDb, configDb, credentialDb, dataDb;
let browserWindow;

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
    }, // Dialogs on workspace use general.save and general.cancel
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

export function initializeSession() {
  const sessionPath = join(configDir, "sessions");
  if (!existsSync(sessionPath)) {
    createRootSessionDirectory();
  }

  metaDb = new JSONdb(join(configDir, "meta.json"), jsonDbConfig);
  let metadata = {
    version: currentVersion,
  };
  if (metaDb) {
    metadata = getMetadata();
  }

  metadata = applyMigrations("meta", currentVersion, metadata);

  if (!metadata.configPath) {
    metadata.configPath = defaultMeta.configPath;
  }
  configDb = new JSONdb(metadata.configPath, jsonDbConfig);
  console.log("metadata.configPath =", metadata.configPath);
  const configData = applyMigrations("config", currentVersion, configDb.JSON());

  if (!metadata.credentialsPath) {
    metadata.credentialsPath = defaultMeta.credentialsPath;
  }
  credentialDb = new JSONdb(metadata.credentialsPath, jsonDbConfig);

  const credentialData = applyMigrations(
    "credentials",
    currentVersion,
    credentialDb.JSON()
  );

  let sessionData;
  if (metadata.sessionDataPath) {
    if (existsSync(metadata.sessionDataPath)) {
      dataDb = new JSONdb(metadata.sessionDataPath, jsonDbConfig);
      sessionData = applyMigrations("data", currentVersion, dataDb.JSON());
    } else {
      metaDb.set("sessionDataPath", "");
    }
  }

  try {
    metaDb.JSON(metadata);
    metaDb.sync();

    configDb.JSON(configData);
    configDb.sync();

    credentialDb.JSON(credentialData);
    credentialDb.sync();

    if (sessionData) {
      dataDb.JSON(sessionData);
      dataDb.sync();
    }
  } catch (error) {
    console.log(error);
  }
}

const recursivelyMerge = (oldConfig, newConfig) => {
  if (!(oldConfig instanceof Object) || Array.isArray(oldConfig)) {
    if (!oldConfig || oldConfig.constructor !== newConfig.constructor) {
      // Overwriting if the type has changed in the default
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
    // Preserving keys in the config but not in default
    if (!Object.keys(newConfig).includes(key)) {
      builtConfig[key] = oldConfig[key];
    }
  }
  return builtConfig;
};

const applyMigrations = async (type, newVersion, data) => {
  let oldVersion = data.version || "0.0.0";
  let migratedData = Object.assign(data, {});

  if (newVersion !== oldVersion) {
    // Split newVersion and oldVersion to compare
    let splitNewVersion = newVersion.substring(1).split(".");
    splitNewVersion = splitNewVersion.map((num) => parseInt(num));
    let splitDataVersion = oldVersion.split(".");
    splitDataVersion = splitDataVersion.map((num) => parseInt(num));
    let direction = "up";
    for (let i = 0; i < splitNewVersion.length; i++) {
      if (splitNewVersion[i] < splitDataVersion[i]) {
        direction = "down";
        break;
      }
    }

    // Read migration files

    const isDevelopment = process.env.NODE_ENV !== "production";
    let migrationFilesPath = isDevelopment
      ? resolve(__dirname, "../src/modules/migrations/")
      : resolve(process.resourcesPath, "./migrations/");


    let migrationFiles = readdirSync(migrationFilesPath);
    let migrationVersions = migrationFiles.map((fileName) => {
      let temp = fileName.substring(1, fileName.length - 3).split(".");
      return temp.map((num) => parseInt(num));
    });
    // List is in order from lowest to highest
    if (direction === "down") {
      migrationFiles.reverse();
      migrationVersions.reverse();
    }

    // Find the the next migration to run.
    let nextMigrationIndex;
    for (let i = 0; i < migrationVersions.length; i++) {
      if (direction === "up") {
        if (migrationVersions[i][0] < splitDataVersion[0]) {
          continue;
        }
        if (migrationVersions[i][0] === splitDataVersion[0]) {
          if (migrationVersions[i][1] < splitDataVersion[1]) {
            continue;
          }

          if (migrationVersions[i][1] > splitDataVersion[1]) {
            nextMigrationIndex = i;
            break;
          }

          if (migrationVersions[i][1] === splitDataVersion[1]) {
            if (migrationVersions[i][2] <= splitDataVersion[2]) {
              continue;
            } else {
              nextMigrationIndex = i;
              break;
            }
          }
        }
        if (migrationVersions[i][0] > splitDataVersion[0]) {
          nextMigrationIndex = i;
          break;
        }
      } else {
        if (migrationVersions[i][0] > splitDataVersion[0]) {
          continue;
        }
        if (migrationVersions[i][0] === splitDataVersion[0]) {
          if (migrationVersions[i][1] > splitDataVersion[1]) {
            continue;
          }

          if (migrationVersions[i][1] < splitDataVersion[1]) {
            nextMigrationIndex = i;
            break;
          }

          if (migrationVersions[i][1] === splitDataVersion[1]) {
            if (migrationVersions[i][2] >= splitDataVersion[2]) {
              continue;
            } else {
              nextMigrationIndex = i;
              break;
            }
          }
        }
        if (migrationVersions[i][0] < splitDataVersion[0]) {
          nextMigrationIndex = i;
          break;
        }
      }
    }

    // Run migrations in order
    for (const migration of migrationFiles.slice(
      nextMigrationIndex,
      migrationFiles.length
    )) {
      const migrationPath = resolve(migrationFilesPath, migration);
      const migrationUrl = pathToFileURL(migrationPath).href;

      const { migrationStruct } = await import(migrationUrl);
      if (!migrationStruct[direction][type]) continue;

      // Order of operations here - move first, then functions
      let moveUpMigrations = {};
      let moveLateralMigrations = {};
      let otherMigrations = {};
      for (const [key, value] of Object.entries(
        migrationStruct[direction][type]
      )) {
        if (
          value === ".." ||
          (value.length > 1 && value.split(".").length > 1)
        ) {
          moveUpMigrations[key] = value;
        } else if (value.constructor === String) {
          moveLateralMigrations[key] = value;
        } else {
          otherMigrations[key] = value;
        }
      }

      migratedData = migrateKeys(moveUpMigrations, migratedData);
      migratedData = migrateKeys(moveLateralMigrations, migratedData);
      migratedData = migrateKeys(otherMigrations, migratedData);
    }
  }

  let updatedData = migratedData;
  switch (type) {
    case "meta":
      updatedData = recursivelyMerge(migratedData, defaultMeta);
      break;
    case "config":
      updatedData = recursivelyMerge(migratedData, defaultConfig);
      break;
  }
  updatedData.version = newVersion;

  return updatedData;
};

const migrateKeys = (migrations, data) => {
  // Apply migration transformations
  for (const [key, value] of Object.entries(migrations)) {
    if (value.constructor === String) {
      if (data[key]) {
        if (value === "..") {
          for (const [subKey, subValue] of Object.entries(data[key])) {
            data[subKey] = subValue;
          }
        } else if (value.length > 1 && value.split(".") > 1) {
          if (/^[A-za-z0-9.-_]+$/.test(value)) {
            eval(`data.${value} = data[key];`);
          } else {
            console.log(`Invalid migration value [${value}] skipping...`);
          }
        } else if (value !== "") {
          data[value] = data[key];
        }
        delete data[key];
      }
    } else if (value.constructor === Function) {
      if (data[key]) {
        data[key] = value(data[key]);
      }
    }
  }
  return data;
};

const createRootSessionDirectory = () => {
  let sessionPaths = [join(configDir, "sessions")];
  sessionPaths.forEach((path) => {
    mkdirSync(path, { recursive: true });
  });
};

const removeItemById = (id) => {
  let session = dataDb.get("session");
  const items = session.items;
  session.items = items.filter((item) => item.stepID !== id);
  dataDb.set("session", session);
};

const getItemById = (id) => {
  const session = dataDb.get("session");
  const item = session.items.find((item) => item.stepID === id);
  return item;
};

export function createNewSession(state) {
  const sessionDataPath = join(
    configDir,
    "sessions",
    state.session.sessionID,
    "sessionData.json"
  );

  metaDb.set("sessionDataPath", sessionDataPath);
  dataDb = new JSONdb(sessionDataPath, jsonDbConfig);
  let session = state.session;
  session.items = [];
  session.notes = {
    content: "",
    text: "",
  };
  dataDb.set("session", session);
  dataDb.set("case", state.case);
  dataDb.set("version", currentVersion);
}

export function getSessionID() {
  try {
    if (dataDb) {
      const session = dataDb.get("session");
      return session.sessionID;
    }
    return "";
  } catch (error) {
    console.log(error);
    return "";
  }
}

export function getCaseID() {
  try {
    if (dataDb) {
      const cas = dataDb.get("case");
      return cas.caseID;
    }
    return "";
  } catch (error) {
    console.log(error);
    return "";
  }
}

export function getState() {
  try {
    if (dataDb) {
      return {
        case: dataDb.get("case"),
        session: dataDb.get("session"),
        version: dataDb.get("version"),
      };
    }
    return {};
  } catch (error) {
    console.log(error);
    return {};
  }
}

// You must pass the entire state to use this.
export function updateState(state) {
  if (dataDb) {
    let session, cse;
    try {
      cse = dataDb.get("case");
      session = dataDb.get("session");
    } catch (error) {
      console.log(error);
      cse = cse || {};
      session = session || {};
    }

    dataDb.set("case", { ...cse, ...state.case });
    dataDb.set("session", { ...session, ...state.session });
  }
}

export function getItems() {
  if (dataDb) {
    try {
      const session = dataDb.get("session");
      return session.items;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  return [];
}

export function addItem(item) {
  try {
    let session = dataDb.get("session");
    let items = session.items || [];
    items.push(item);
    session.items = items;
    dataDb.set("session", session);
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("DATA_CHANGE");
  } catch (error) {
    console.log(error);
  }
}

export function updateItem(newItem) {
  try {
    debugger;
    let session = dataDb.get("session");
    let items = session.items.map((item) => {
      if (item.stepID === newItem.stepID) {
        return newItem;
      }
      return item;
    });
    session.items = items;
    dataDb.set("session", session);
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("DATA_CHANGE");
  } catch (error) {
    console.log(error);
  }
}

export function updateItems(items) {
  try {
    let session = dataDb.get("session");
    if (!session) {
      dataDb.set("session", {});
      session = {};
    }
    session.items = items;
    dataDb.set("session", session);
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("DATA_CHANGE");
  } catch (error) {
    console.log(error);
  }
}

export function deleteItems(ids) {
  try {
    ids.map((id) => {
      removeItemById(id);
    });
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("DATA_CHANGE");
    return Promise.resolve({
      status: STATUSES.SUCCESS,
      message: "Element removed successfully",
    });
  } catch (error) {
    return Promise.resolve({ status: STATUSES.ERROR, message: error.message });
  }
}

const _getItemById = (id) => {
  try {
    const data = getItemById(id);
    return data;
  } catch (error) {
    return null;
  }
};
export { _getItemById as getItemById };

export function getConfig() {
  try {
    return configDb.JSON();
  } catch (error) {
    return {};
  }
}

export function updateConfig(config) {
  try {
    configDb.JSON(config);
    configDb.sync();
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("CONFIG_CHANGE");
  } catch (error) {
    console.log(error);
  }
}

export function getCredentials() {
  try {
    // eslint-disable-next-line no-unused-vars
    const { version: _, ...credentials } = credentialDb.JSON();
    return credentials;
  } catch (error) {
    return {};
  }
}

export function updateCredentials(credentials) {
  try {
    credentialDb.JSON(credentials);
    credentialDb.sync();
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("CREDENTIAL_CHANGE");
  } catch (error) {
    console.log(error);
  }
}

export function getMetadata() {
  try {
    return metaDb.JSON();
  } catch (error) {
    console.log(`Unable to retrieve metadata: ${error}`);
    return {};
  }
}

export function updateMetadata(meta) {
  try {
    for (const [key, value] of Object.entries(meta)) {
      metaDb.set(key, value);
    }
    if (meta.configPath) {
      configDb = new JSONdb(meta.configPath, jsonDbConfig);
    }
    if (meta.credentialsPath) {
      credentialDb = new JSONdb(meta.credentialsPath, jsonDbConfig);
    }
    if (meta.sessionDataPath) {
      dataDb = new JSONdb(meta.sessionDataPath, jsonDbConfig);
    }
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("META_CHANGE");
  } catch (error) {
    console.log(error);
  }
}

export function getNotes() {
  try {
    const session = dataDb.get("session");
    return session.notes;
  } catch (error) {
    return [];
  }
}

export function updateNotes(notes) {
  try {
    let session = dataDb.get("session");
    session.notes = notes;
    dataDb.set("session", session);
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("DATA_CHANGE");
  } catch (error) {
    console.log(error);
  }
}

export function getNodes() {
  try {
    const session = dataDb.get("session");
    return session.nodes;
  } catch (error) {
    return [];
  }
}

export function updateNodes(nodes) {
  try {
    let session = dataDb.get("session");
    session.nodes = nodes;
    dataDb.set("session", session);
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("DATA_CHANGE");
  } catch (error) {
    console.log(error);
  }
}

export function getConnections() {
  try {
    const session = dataDb.get("session");
    return session.connections;
  } catch (error) {
    return [];
  }
}

export function updateConnections(connections) {
  try {
    let session = dataDb.get("session");
    session.connections = connections;
    dataDb.set("session", session);
    browserWindow = getBrowserWindow();
    browserWindow.webContents.send("DATA_CHANGE");
  } catch (error) {
    console.log(error);
  }
}

export function resetData() {
  if (existsSync(metaDb.get("sessionDataPath"))) {
    try {
      let session = dataDb.get("session");
      session.items = [];
      session.notes = {
        content: "",
        text: "",
      };
      dataDb.set("session", session);
      browserWindow = getBrowserWindow();
      browserWindow.webContents.send("DATA_CHANGE");
    } catch (error) {
      console.log(error);
    }
  }
}
