import { app, BrowserWindow, screen } from "electron";

let isDevelopment = process.env.NODE_ENV !== "production";

let settingsWin, modalWin;

import { getBrowserWindow, getLowProfiledWindow, setLowProfiledWindow, setViewMode, getParentWindow } from "./BrowserWindowUtility";
import { join } from "path";

import { VIEW_MODE, IPC_BIND_KEYS } from "./constants";

export async function setDevMode({ enabled }) {
  isDevelopment = enabled;
}

export function getMainWindow() {  
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    center: true,
    // eslint-disable-next-line no-undef
    icon: join(app.getAppPath(), "src/assets/icon/logo.png"),
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      preload: join(__dirname, "preload.js"),
    },
  });

  return win;
}

export function openLowProfileWindow(data) {
  const browserWindow = getBrowserWindow();
  const lowProfiledWindow = getLowProfiledWindow();
  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/#/minimize"
      : `file://${__dirname}/index.html#minimize`;

  if (!lowProfiledWindow || lowProfiledWindow.isDestroyed) {
    let display = screen.getPrimaryDisplay();
    let displayWidth = display.bounds.width;
    let minimizeWin = new BrowserWindow({
      width: 1024,
      height: 768,
      minWidth: 480,
      minHeight: 84,
      x: displayWidth - 1024,
      y: 50,
      frame: false,
      transparent: true,
      resizable: false,
      // eslint-disable-next-line no-undef
      icon: join(app.getAppPath(), "src/assets/icon/logo.png"),
      webPreferences: {
        devTools: false,
        nodeIntegration: true,
        webSecurity: false,
        enableRemoteModule: true,
        preload: join(__dirname, "preload.js"),
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
      setLowProfiledWindow(null);
      browserWindow.show();
    });

    setLowProfiledWindow(minimizeWin);
    browserWindow.hide();
  } else {
    browserWindow.hide();
    lowProfiledWindow.webContents.send("STATE_DATA", data.data);
    lowProfiledWindow.show();
  }

  setViewMode(VIEW_MODE.MINI);
}

export function closeLowProfileWindow(data) {
  const browserWindow = getBrowserWindow();
  const lowProfiledWindow = getLowProfiledWindow();
  lowProfiledWindow.close();
  browserWindow.webContents.send(data.bindKey, data.data);
  setViewMode(VIEW_MODE.NORMAL);
}

export function closeSessionAndLowProfiledWindow(data) {
  const browserWindow = getBrowserWindow();
  const lowProfiledWindow = getLowProfiledWindow();
  lowProfiledWindow.hide();
  browserWindow.webContents.send(IPC_BIND_KEYS.END_SESSION, data.data);
  browserWindow.show();
  setViewMode(VIEW_MODE.NORMAL);
}

export function openSettingWindow() {
  const browserWindow = getBrowserWindow();
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
      icon: join(app.getAppPath(), "src/assets/icon/logo.png"),
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        enableRemoteModule: true,
        preload: join(__dirname, "preload.js"),
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
}

export function closeSettingWindow() {
  settingsWin.close();
}

export function setWindowSize({ width, height }) {
  // TODO - Handle window sizing better without manual resizing and fixed sizes
  const browserWindow = getBrowserWindow();
  browserWindow.setSize(width, height);
  browserWindow.center();
}

export function openModalWindow(data) {
  const parentWindow = getParentWindow();
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
      icon: join(app.getAppPath(), "src/assets/icon/logo.png"),
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        webSecurity: false,
        enableRemoteModule: true,
        preload: join(__dirname, "preload.js"),
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
}

export function closeModalWindow(data) {
  if (data) {
    const parentWindow = getParentWindow();
    parentWindow.webContents.send(data.bindKey, data.data);
  }
  modalWin.close();
}

export function moveWindow(data) {
  const minimizeWindow = getLowProfiledWindow();

  const currentPosition = minimizeWindow.getPosition();
  minimizeWindow.setPosition(
    currentPosition[0] + data.x,
    currentPosition[1] + data.y
  );
}
