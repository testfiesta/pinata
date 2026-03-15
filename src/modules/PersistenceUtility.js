import JSONdb from "simple-json-db";
import { app, remote } from "electron";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { getBrowserWindow } from "./BrowserWindowUtility";
import { STATUSES } from "./constants";

const configDir = (app || remote.app).getPath("userData");
const jsonDbConfig = {
  jsonSpaces: 2,
};

const currentVersion = app.getVersion();

let metaDb, configDb, credentialDb, dataDb;
let browserWindow;

const { 
  getMetaDb, 
  getConfigDb, 
  getCredentialDb, 
  getDataDb,
  runMigrations
} = require(join(__dirname, 'migrations.js'));

export async function initializeSession() {
  const sessionPath = join(configDir, "sessions");
  if (!existsSync(sessionPath)) {
    createRootSessionDirectory();
  }
  await runMigrations();
  metaDb = getMetaDb();
  configDb = getConfigDb();
  credentialDb = getCredentialDb();
  dataDb = getDataDb();
}

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
