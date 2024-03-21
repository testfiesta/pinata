import { ipcMain } from "electron";
import { IPC_HANDLERS, IPC_FUNCTIONS } from "./constants";
const captureUtility = require("./CaptureUtility");
const persistenceUtility = require("./PersistenceUtility");
const fileSystemUtility = require("./FileSystemUtility");
const menuUtility = require("./MenuUtility");
const windowUtility = require("./WindowUtility");
const serverUtility = require("./ServerUtility");
const systemInfoUtility = require("./SystemInfoUtility");

ipcMain.handle(IPC_HANDLERS.BROWSER, async (event, args) => {
  switch (args.func) {
    default:
      return null;
  }
});

ipcMain.handle(IPC_HANDLERS.CAPTURE, async (event, args) => {
  switch (args.func) {
    case IPC_FUNCTIONS.GET_MEDIA_SOURCE:
      return captureUtility.getMediaSource();
    case IPC_FUNCTIONS.SAVE_NOTE:
      return captureUtility.saveNote(args.data);
    case IPC_FUNCTIONS.CREATE_IMAGE:
      return captureUtility.createImage(args.data);
    case IPC_FUNCTIONS.UPDATE_IMAGE:
      return captureUtility.updateImage(args.data);
    case IPC_FUNCTIONS.CREATE_VIDEO:
      return captureUtility.createVideo(args.data);
    case IPC_FUNCTIONS.UPDATE_VIDEO:
      return captureUtility.updateVideo(args.data);
    case IPC_FUNCTIONS.OPTIMIZE_VIDEO:
      return captureUtility.optimizeVideo(args.data);
    case IPC_FUNCTIONS.DELETE_FILE:
      return captureUtility.deleteFile(args.data);
    case IPC_FUNCTIONS.UPLOAD_EVIDENCE:
      return captureUtility.uploadEvidence(args.data);
    case IPC_FUNCTIONS.CREATE_AUDIO:
      return captureUtility.createAudio(args.data);
    case IPC_FUNCTIONS.UPDATE_AUDIO:
      return captureUtility.updateAudio(args.data);
    case IPC_FUNCTIONS.DROP_FILE:
      return captureUtility.dropFile(args.data);
    case IPC_FUNCTIONS.SET_APPEARANCE:
      return captureUtility.setAppearance(args.data);
    default:
      return null;
  }
});

ipcMain.handle(IPC_HANDLERS.WINDOW, async (event, args) => {
  switch (args.func) {
    case IPC_FUNCTIONS.SET_DEV_MODE:
      return windowUtility.setDevMode(args.data);
    case IPC_FUNCTIONS.OPEN_ADD_WINDOW:
      return windowUtility.openAddWindow(args.data);
    case IPC_FUNCTIONS.CLOSE_ADD_WINDOW:
      return windowUtility.closeAddWindow(args.data);
    case IPC_FUNCTIONS.OPEN_EDIT_WINDOW:
      return windowUtility.openEditWindow(args.data);
    case IPC_FUNCTIONS.CLOSE_EDIT_WINDOW:
      return windowUtility.closeEditWindow(args.data);
    case IPC_FUNCTIONS.OPEN_SETTING_WINDOW:
      return windowUtility.openSettingWindow(args.data);
    case IPC_FUNCTIONS.CLOSE_SETTING_WINDOW:
      return windowUtility.closeSettingWindow(args.data);
    case IPC_FUNCTIONS.OPEN_MINIMIZE_WINDOW:
      return windowUtility.openMinimizeWindow(args.data);
    case IPC_FUNCTIONS.CLOSE_MINIMIZE_WINDOW:
      return windowUtility.closeMinimizeWindow(args.data);
    case IPC_FUNCTIONS.CLOSE_SESSION_AND_MINIIMIZED_WINDOW:
      return windowUtility.closeSessionAndMinimizedWindow(args.data);
    case IPC_FUNCTIONS.SET_WINDOW_SIZE:
      return windowUtility.setWindowSize(args.data);
    case IPC_FUNCTIONS.OPEN_MODAL_WINDOW:
      return windowUtility.openModalWindow(args.data);
    case IPC_FUNCTIONS.CLOSE_MODAL_WINDOW:
      return windowUtility.closeModalWindow(args.data);
    case IPC_FUNCTIONS.OPEN_NOTES_WINDOW:
      return windowUtility.openNotesWindow(args.data);
    case IPC_FUNCTIONS.CLOSE_NOTES_WINDOW:
      return windowUtility.closeNotesWindow();
    case IPC_FUNCTIONS.MOVE_WINDOW:
      return windowUtility.moveWindow(args.data);
    case IPC_FUNCTIONS.RESET_SESSION:
      return windowUtility.resetSession(args.data);
    default:
      return null;
  }
});

ipcMain.handle(IPC_HANDLERS.PERSISTENCE, async (event, args) => {
  switch (args.func) {
    case IPC_FUNCTIONS.INITIALIZE_SESSION:
      return persistenceUtility.initializeSession();
    case IPC_FUNCTIONS.GET_SESSION_ID:
      return persistenceUtility.getSessionID();
    case IPC_FUNCTIONS.GET_CASE_ID:
      return persistenceUtility.getCaseID();
    case IPC_FUNCTIONS.GET_STATE:
      return persistenceUtility.getState();
    case IPC_FUNCTIONS.UPDATE_STATE:
      return persistenceUtility.updateState(args.data);
    case IPC_FUNCTIONS.ADD_ITEM:
      return persistenceUtility.addItem(args.data);
    case IPC_FUNCTIONS.GET_ITEMS:
      return persistenceUtility.getItems();
    case IPC_FUNCTIONS.UPDATE_ITEM:
      return persistenceUtility.updateItem(args.data);
    case IPC_FUNCTIONS.UPDATE_ITEMS:
      return persistenceUtility.updateItems(args.data);
    case IPC_FUNCTIONS.DELETE_ITEMS:
      return persistenceUtility.deleteItems(args.data);
    case IPC_FUNCTIONS.GET_ITEM_BY_ID:
      return persistenceUtility.getItemById(args.data);
    case IPC_FUNCTIONS.GET_CONFIG:
      return persistenceUtility.getConfig(args.data);
    case IPC_FUNCTIONS.UPDATE_CONFIG:
      return persistenceUtility.updateConfig(args.data);
    case IPC_FUNCTIONS.GET_CREDENTIALS:
      return persistenceUtility.getCredentials(args.data);
    case IPC_FUNCTIONS.UPDATE_CREDENTIALS:
      return persistenceUtility.updateCredentials(args.data);
    case IPC_FUNCTIONS.GET_METADATA:
      return persistenceUtility.getMetadata(args.data);
    case IPC_FUNCTIONS.UPDATE_METADATA:
      return persistenceUtility.updateMetadata(args.data);
    case IPC_FUNCTIONS.UPDATE_NOTES:
      return persistenceUtility.updateNotes(args.data);
    case IPC_FUNCTIONS.GET_NOTES:
      return persistenceUtility.getNotes(args.data);
    case IPC_FUNCTIONS.RESET_DATA:
      return persistenceUtility.resetData(args.data);
    default:
      return null;
  }
});

ipcMain.handle(IPC_HANDLERS.FILE_SYSTEM, async (event, args) => {
  switch (args.func) {
    case IPC_FUNCTIONS.EXPORT_ITEMS:
      return fileSystemUtility.exportItems(args.data);
    case IPC_FUNCTIONS.CREATE_NEW_SESSION:
      return fileSystemUtility.createNewSession(args.data);
    case IPC_FUNCTIONS.RESET_SESSION:
    case IPC_FUNCTIONS.SAVE_SESSION:
      return fileSystemUtility.saveSession(args.data);
    case IPC_FUNCTIONS.OPEN_SESSION:
      return fileSystemUtility.openSession(args.data);
    case IPC_FUNCTIONS.EXPORT_SESSION:
      return fileSystemUtility.exportSession(args.data);
    case IPC_FUNCTIONS.OPEN_CONFIG_FILE:
      return fileSystemUtility.openConfigFile(args.data);
    case IPC_FUNCTIONS.OPEN_CREDENTIALS_FILE:
      return fileSystemUtility.openCredentialsFile(args.data);
    case IPC_FUNCTIONS.DRAG_ITEM:
      return fileSystemUtility.dragItem(event, args.data);
    case IPC_FUNCTIONS.OPEN_EXTERNAL_LINK:
      return fileSystemUtility.openExternalLink(args.data);
    default:
      return null;
  }
});

ipcMain.handle(IPC_HANDLERS.MENU, async (event, args) => {
  switch (args.func) {
    case IPC_FUNCTIONS.CHANGE_MENUITEM_STATUS:
      return menuUtility.changeMenuItemStatus(args.data);
  }
});

ipcMain.handle(IPC_HANDLERS.SERVER, async (event, args) => {
  switch (args.func) {
    case IPC_FUNCTIONS.START_SERVER:
      return serverUtility.startServer(args.data);
    case IPC_FUNCTIONS.STOP_SERVER:
      return serverUtility.stopServer(args.data);
  }
});

ipcMain.handle(IPC_HANDLERS.SYSTEMINFO, async (event, args) => {
  switch (args.func) {
    case IPC_FUNCTIONS.GET_SYSTEM_INFO:
      return await systemInfoUtility.getSystemInfo();
  }
})
