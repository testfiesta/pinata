const { app, BrowserWindow, screen } = require("electron");
const iohook = require("iohook2");

let isDevelopment = process.env.NODE_ENV !== "production";

let addWin, editWin, settingsWin, notesWin, modalWin;

const browserUtility = require("./BrowserWindowUtility");
const path = require("path");

const { VIEW_MODE, IPC_BIND_KEYS } = require("./constants");
let capturedEvents = [];

module.exports.setDevMode = async ({ enabled }) => {
  isDevelopment = enabled;
};

module.exports.startKeyboardCapture = () => {
  iohook.start();
  const startingPoint = Date.now();
  capturedEvents = [];

  iohook.on("keydown", (event) => {
    if (
      (event.ctrl || event.shift || event.alt || event.meta) &&
      !isControlKey(event.key)
    ) {
      // If Ctrl, Shift, Alt or Meta key is pressed along with a regular key
      capturedEvents.push({
        type: "hotkey",
        text: `${event.ctrl ? "Ctrl+" : ""}${event.shift ? "Shift+" : ""}${
          event.alt ? "Alt+" : ""
        }${event.meta ? "Meta+" : ""}${event.key.toUpperCase()}`,
        start: parseFloat((Date.now() - startingPoint) / 1000).toFixed(2),
        end: parseFloat(((Date.now() - startingPoint) / 1000).toFixed(2)) + 1,
      });
    }
  });

  function isControlKey(key) {
    // Check if the key is one of the individual control keys
    return [
      "leftCtrl",
      "rightCtrl",
      "leftAlt",
      "rightAlt",
      "leftShift",
      "rightShift",
      "leftMeta",
      "rightMeta",
    ].includes(key);
  }

  iohook.on("mousedown", () => {
    capturedEvents.push({
      type: "mouse",
      text: "Mouse Click",
      start: parseFloat((Date.now() - startingPoint) / 1000).toFixed(2),
      end: parseFloat(((Date.now() - startingPoint) / 1000).toFixed(2)) + 1,
    });
  });
};

module.exports.stopKeyboardCapture = () => {
  iohook.stop();
  return capturedEvents;
};

module.exports.getMainWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    center: true,
    // eslint-disable-next-line no-undef
    icon: path.join(__static, "logo.png"),
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      preload: path.join(app.getAppPath(), "preload.js"),
    },
  });

  return win;
};

module.exports.openMinimizeWindow = (data) => {
  const browserWindow = browserUtility.getBrowserWindow();
  const minimizedWindow = browserUtility.getMinimizedWindow();

  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/#/minimize"
      : `file://${__dirname}/index.html#minimize`;

  if (!minimizedWindow || minimizedWindow.isDestroyed) {
    let display = screen.getPrimaryDisplay();
    let displayWidth = display.bounds.width;
    let minimizeWin = new BrowserWindow({
      width: 480,
      height: 84,
      minWidth: 480,
      minHeight: 84,
      x: displayWidth - 480,
      y: 50,
      frame: false,
      transparent: true,
      resizable: false,
      // eslint-disable-next-line no-undef
      icon: path.join(__static, "logo.png"),
      webPreferences: {
        devTools: false,
        nodeIntegration: true,
        webSecurity: false,
        enableRemoteModule: true,
        preload: path.join(app.getAppPath(), "preload.js"),
      },
    });

    minimizeWin.loadURL(url);
    minimizeWin.setMenuBarVisibility(false);
    minimizeWin.setAlwaysOnTop(true);

    minimizeWin.once("ready-to-show", () => {
      minimizeWin.webContents.send("STATE_DATA", data.data);
      minimizeWin.show();
    });

    minimizeWin.on("close", () => {
      minimizeWin = null;
      browserUtility.setMinimizedWindow(null);
      browserWindow.show();
    });

    browserUtility.setMinimizedWindow(minimizeWin);
    browserWindow.hide();
  } else {
    browserWindow.hide();
    minimizedWindow.webContents.send("STATE_DATA", data.data);
    minimizedWindow.show();
  }

  browserUtility.setViewMode(VIEW_MODE.MINI);
};

module.exports.closeMinimizeWindow = (data) => {
  const browserWindow = browserUtility.getBrowserWindow();
  const minimizedWindow = browserUtility.getMinimizedWindow();
  minimizedWindow.close();
  browserWindow.webContents.send(data.bindKey, data.data);
  browserUtility.setViewMode(VIEW_MODE.NORMAL);
};

module.exports.closeSessionAndMinimizedWindow = (data) => {
  const browserWindow = browserUtility.getBrowserWindow();
  const minimizedWindow = browserUtility.getMinimizedWindow();
  minimizedWindow.hide();
  browserWindow.webContents.send(IPC_BIND_KEYS.END_SESSION, data.data);
  browserWindow.show();
  browserUtility.setViewMode(VIEW_MODE.NORMAL);
};

module.exports.openAddWindow = ({ width, height, data }) => {
  const parentWindow = browserUtility.getParentWindow();

  const modalPath =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/#/addEvidence"
      : `file://${__dirname}/index.html#addEvidence`;

  if (!addWin) {
    addWin = new BrowserWindow({
      width: width,
      height: height,
      minWidth: width,
      minHeight: height,
      center: true,
      parent: parentWindow,
      // eslint-disable-next-line no-undef
      icon: path.join(__static, "logo.png"),
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        enableRemoteModule: true,
        preload: path.join(app.getAppPath(), "preload.js"),
      },
    });

    addWin.loadURL(modalPath);
    addWin.setMenuBarVisibility(false);
    addWin.once("ready-to-show", () => {
      if (isDevelopment) {
        addWin.webContents.openDevTools();
      }
      addWin.show();

      parentWindow.webContents.send("OPEN_CHILD_WINDOW");
    });

    addWin.webContents.on("did-finish-load", () => {
      addWin.webContents.send("ACTIVE_SESSION", data);
    });

    addWin.on("close", () => {
      parentWindow.webContents.send("CLOSE_CHILD_WINDOW", { data: "add" });
      addWin = null;
    });
  }
};

module.exports.closeAddWindow = () => {
  const browserWindow = browserUtility.getBrowserWindow();
  browserWindow.webContents.send("DATA_CHANGE", {});
  addWin.close();
};

module.exports.openEditWindow = (data) => {
  const browserWindow = browserUtility.getBrowserWindow();
  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/#/editEvidence"
      : `file://${__dirname}/index.html#editEvidence`;

  if (!editWin) {
    editWin = new BrowserWindow({
      width: 800,
      height: 800,
      minWidth: 800,
      minHeight: 800,
      center: true,
      parent: browserWindow,
      // eslint-disable-next-line no-undef
      icon: path.join(__static, "logo.png"),
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        enableRemoteModule: true,
        preload: path.join(app.getAppPath(), "preload.js"),
      },
    });

    editWin.loadURL(url);
    editWin.setMenuBarVisibility(false);

    editWin.once("ready-to-show", () => {
      if (isDevelopment) {
        editWin.webContents.openDevTools();
      }
      editWin.show();
      browserWindow.webContents.send("OPEN_CHILD_WINDOW");
    });

    editWin.webContents.on("did-finish-load", () => {
      editWin.webContents.send("ACTIVE_SESSION", data);
    });

    editWin.on("close", () => {
      browserWindow.webContents.send("CLOSE_CHILD_WINDOW", { data: "edit" });
      editWin = null;
    });
  }
};

module.exports.closeEditWindow = () => {
  editWin.close();
};

module.exports.openSettingWindow = () => {
  const browserWindow = browserUtility.getBrowserWindow();
  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/#/settings"
      : `file://${__dirname}/index.html#settings`;

  if (!settingsWin) {
    settingsWin = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      center: true,
      parent: browserWindow,
      // eslint-disable-next-line no-undef
      icon: path.join(__static, "logo.png"),
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        enableRemoteModule: true,
        preload: path.join(app.getAppPath(), "preload.js"),
      },
    });

    settingsWin.loadURL(url);
    settingsWin.setMenuBarVisibility(false);

    settingsWin.once("ready-to-show", () => {
      if (isDevelopment) {
        settingsWin.webContents.openDevTools();
      }
      settingsWin.show();
      browserWindow.webContents.send("OPEN_CHILD_WINDOW");
    });

    settingsWin.on("close", () => {
      browserWindow.webContents.send("CLOSE_CHILD_WINDOW", { data: "setting" });
      settingsWin = null;
    });
  }
};

module.exports.closeSettingWindow = () => {
  settingsWin.close();
};

module.exports.setWindowSize = ({ width, height }) => {
  // TODO - Handle window sizing better without manual resizing and fixed sizes
  const browserWindow = browserUtility.getBrowserWindow();
  browserWindow.setSize(width, height);
  browserWindow.center();
};

module.exports.openModalWindow = (data) => {
  const parentWindow = browserUtility.getParentWindow();
  const url =
    process.env.NODE_ENV === "development"
      ? `http://localhost:8080/#/${data.path}`
      : `file://${__dirname}/index.html#${data.path}`;

  if (!modalWin) {
    modalWin = new BrowserWindow({
      width: data.size.width,
      height: data.size.height,
      minWidth: data.size.minWidth,
      minHeight: data.size.minHeight,
      center: true,
      parent: parentWindow,
      resizable: false,
      // eslint-disable-next-line no-undef
      icon: path.join(__static, "logo.png"),
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        enableRemoteModule: true,
        preload: path.join(app.getAppPath(), "preload.js"),
      },
    });

    modalWin.loadURL(url);
    modalWin.setMenuBarVisibility(false);

    modalWin.once("ready-to-show", () => {
      if (isDevelopment) {
        modalWin.webContents.openDevTools();
      }
      modalWin.webContents.send(IPC_BIND_KEYS.MODAL_DATA, data.data);
      modalWin.show();
      parentWindow.webContents.send("OPEN_CHILD_WINDOW");
    });

    modalWin.on("close", () => {
      parentWindow.webContents.send("CLOSE_CHILD_WINDOW");
      modalWin = null;
    });
  }
};

module.exports.closeModalWindow = (data) => {
  if (data) {
    const parentWindow = browserUtility.getParentWindow();
    parentWindow.webContents.send(data.bindKey, data.data);
  }
  modalWin.close();
};

module.exports.openNotesWindow = (data) => {
  const browserWindow = browserUtility.getBrowserWindow();
  const modalPath =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/#/note"
      : `file://${__dirname}/index.html#note`;

  if (!notesWin) {
    notesWin = new BrowserWindow({
      width: data.width,
      height: data.height,
      minWidth: data.width,
      minHeight: data.height,
      center: true,
      parent: browserWindow,
      // eslint-disable-next-line no-undef
      icon: path.join(__static, "logo.png"),
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        enableRemoteModule: true,
        preload: path.join(app.getAppPath(), "preload.js"),
      },
    });

    notesWin.loadURL(modalPath);
    notesWin.setMenuBarVisibility(false);
    notesWin.once("ready-to-show", () => {
      if (isDevelopment) {
        notesWin.webContents.openDevTools();
      }
      notesWin.show();
      browserWindow.webContents.send("OPEN_CHILD_WINDOW");
    });

    notesWin.webContents.on("did-finish-load", () => {});

    notesWin.on("close", () => {
      browserWindow.webContents.send("CLOSE_CHILD_WINDOW", { data: "notes" });
      notesWin = null;
    });
  }
};

module.exports.closeNotesWindow = () => {
  notesWin.close();
};

module.exports.moveWindow = (data) => {
  const minimizeWindow = browserUtility.getMinimizedWindow();

  const currentPosition = minimizeWindow.getPosition();
  minimizeWindow.setPosition(
    currentPosition[0] + data.x,
    currentPosition[1] + data.y
  );
};
