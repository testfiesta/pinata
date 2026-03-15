"use strict";

import { app, protocol, BrowserWindow, session } from "electron";

import createMenu from "./menu.js";
import { VIEW_MODE } from "../modules/constants.js";

import * as browserUtility from "../modules/BrowserWindowUtility.js";
import * as persistenceUtility from "../modules/PersistenceUtility.js";
import * as windowUtility from "../modules/WindowUtility.js";
import * as serverUtility from "../modules/ServerUtility.js";

import "../modules/IpcHandlers.js";

let isDevelopment = process.env.NODE_ENV !== "production";

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

  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await win.loadFile("dist_electron/index.html");
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