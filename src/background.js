"use strict";

import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

import createMenu from "./menu";
import { VIEW_MODE } from "./modules/constants";

let isDevelopment = process.env.NODE_ENV !== "production";

const browserUtility = require("./modules/BrowserWindowUtility");
const persistenceUtility = require("./modules/PersistenceUtility");
const windowUtility = require("./modules/WindowUtility");
const serverUtility = require("./modules/ServerUtility");

import { session } from "electron";

require("./modules/IpcHandlers");

// initialize session
persistenceUtility.initializeSession();

// Check for enabling dev mode
const startupConfig = persistenceUtility.getConfig();
if (startupConfig.debugMode) {
  isDevelopment = true;
  windowUtility.setDevMode({ enabled: true });
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = windowUtility.getMainWindow();
  browserUtility.setBrowserWindow(win);
  browserUtility.setViewMode(VIEW_MODE.NORMAL);
  if (isDevelopment) {
    win.webContents.openDevTools();
  }

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  createMenu(win, isDevelopment);
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  serverUtility.stopServer();

  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // Changing the User-Agent is required for JIRA token integration to work.
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = "PINATA";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
