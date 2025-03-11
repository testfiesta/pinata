import {
  IPC_HANDLERS,
  IPC_FUNCTIONS,
  IPC_BIND_KEYS,
} from "@/modules/constants";

export default class ElectronService {
  // Listeners

  onOpenSettingWindow(callback) {
    window.ipc.on("APP_SETTING", callback);
  }
  onOpenAboutWindow(callback) {
    window.ipc.on("ABOUT_DIALOG", callback);
  }

  onOpenChildWindow(callback) {
    window.ipc.on("OPEN_CHILD_WINDOW", callback);
  }

  onCloseChildWindow(callback) {
    window.ipc.on("CLOSE_CHILD_WINDOW", callback);
  }
  onNewSession(callback) {
    window.ipc.on("NEW_SESSION", callback);
  }

  onOpenSession(callback) {
    window.ipc.on("OPEN_SESSION", callback);
  }

  onSaveSession(callback) {
    window.ipc.on("SAVE_SESSION", callback);
  }

  onActiveSession(callback) {
    window.ipc.on("ACTIVE_SESSION", callback);
  }

  onResetSession(callback) {
    window.ipc.on("RESET_SESSION", callback);
  }

  onDataChange(callback) {
    window.ipc.on("DATA_CHANGE", callback);
  }

  onMetaChange(callback) {
    window.ipc.on("META_CHANGE", callback);
  }

  onConfigChange(callback) {
    window.ipc.on("CONFIG_CHANGE", callback);
  }

  onCredentialChange(callback) {
    window.ipc.on("CREDENTIAL_CHANGE", callback);
  }

  onSetTheme(callback) {
    window.ipc.on("SET_THEME", callback);
  }

  onJiraLogin(callback) {
    window.ipc.on("JIRA_LOGIN", callback);
  }

  onModalData(callback) {
    window.ipc.on(IPC_BIND_KEYS.MODAL_DATA, callback);
  }

  // Global hotkey listeners
  onGlobalHotkeyTriggered(callback) {
    window.ipc.on("GLOBAL_HOTKEY_TRIGGERED", callback);
  }

  onGlobalHotkeyRegistered(callback) {
    window.ipc.on("GLOBAL_HOTKEY_REGISTERED", callback);
  }

  onGlobalHotkeyUnregistered(callback) {
    window.ipc.on("GLOBAL_HOTKEY_UNREGISTERED", callback);
  }

  onGlobalHotkeyError(callback) {
    window.ipc.on("GLOBAL_HOTKEY_ERROR", callback);
  }

  // Invokers
  setWindowSize({ width, height }) {
    window.ipc.invoke(IPC_HANDLERS.WINDOW, {
      func: IPC_FUNCTIONS.SET_WINDOW_SIZE,
      data: {
        width,
        height,
      },
    });
  }

  async openSettingWindow() {
    return await window.ipc.invoke(IPC_HANDLERS.WINDOW, {
      func: IPC_FUNCTIONS.OPEN_SETTING_WINDOW,
    });
  }

  async closeAddWindow() {
    return await window.ipc.invoke(IPC_HANDLERS.WINDOW, {
      func: IPC_FUNCTIONS.CLOSE_ADD_WINDOW,
    });
  }

  async closeShareOauthWindow() {
    return await window.ipc.invoke(IPC_HANDLERS.WINDOW, {
      func: IPC_FUNCTIONS.CLOSE_MODAL_WINDOW,
      data: {
        bindKey: IPC_BIND_KEYS.CLOSED_SHARE_OAUTH_DIALOG,
      },
    });
  }

  async openConfigFile() {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.OPEN_CONFIG_FILE,
    });
  }

  async openCredentialsFile() {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.OPEN_CREDENTIALS_FILE,
    });
  }

  async openLowProfileWindow() {
    return await window.ipc.invoke(IPC_HANDLERS.WINDOW, {
      func: IPC_FUNCTIONS.OPEN_LOWPROFILE_WINDOW,
      data: { width: 400, height: 84 },
    });
  }

  async closeEditWindow() {
    return await window.ipc.invoke(IPC_HANDLERS.WINDOW, {
      func: IPC_FUNCTIONS.CLOSE_EDIT_WINDOW,
    });
  }

  async openExternalLink(url) {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.OPEN_EXTERNAL_LINK,
      data: url,
    });
  }

  async uploadEvidence() {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.UPLOAD_EVIDENCE,
    });
  }

  async dragItem(item) {
    console.log(item);
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.DRAG_ITEM,
      data: item,
    });
  }

  async dropFile(event) {
    const f = event.dataTransfer.files[0];
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.DROP_FILE,
      data: {
        path: f.path,
        name: f.name,
      },
    });
  }

  async getMediaSource() {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.GET_MEDIA_SOURCE,
    });
  }

  async createImage(imgURI, isPoster = false) {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.CREATE_IMAGE,
      data: { url: imgURI, isPoster },
    });
  }

  async updateImage(item, url) {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.UPDATE_IMAGE,
      data: { item, url },
    });
  }

  async updateAudio(item) {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.UPDATE_AUDIO,
      data: { item },
    });
  }

  async createVideo(buffer) {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.CREATE_VIDEO,
      data: { buffer },
    });
  }

  async updateVideo(item, start, end, previousDuration) {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.UPDATE_VIDEO,
      data: {
        item,
        start,
        end,
        previousDuration,
      },
    });
  }

  async optimizeVideo(filePath) {
    return window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.OPTIMIZE_VIDEO,
      data: {
        filePath,
      },
    });
  }

  async createAudio(buffer) {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.CREATE_AUDIO,
      data: { buffer },
    });
  }

  async exportItems(items) {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.EXPORT_ITEMS,
      data: items,
    });
  }

  async openSession() {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.OPEN_SESSION,
    });
  }

  async changeMenuBySessionStatus(sessionStatus) {
    return await window.ipc.invoke(IPC_HANDLERS.MENU, {
      func: IPC_FUNCTIONS.CHANGE_MENUITEM_STATUS,
      data: { sessionStatus },
    });
  }

  async deleteFile(filePath) {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.DELETE_FILE,
      data: { filePath },
    });
  }

  async setAppearance(theme) {
    return await window.ipc.invoke(IPC_HANDLERS.CAPTURE, {
      func: IPC_FUNCTIONS.SET_APPEARANCE,
      data: { theme },
    });
  }

  async exportSession(data) {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.EXPORT_SESSION,
      data,
    });
  }

  async deleteSession(data) {
    return await window.ipc.invoke(IPC_HANDLERS.FILE_SYSTEM, {
      func: IPC_FUNCTIONS.DELETE_SESSION,
      data,
    });
  }

  async stopServer() {
    return await window.ipc.invoke(IPC_HANDLERS.SERVER, {
      func: IPC_FUNCTIONS.STOP_SERVER,
    });
  }

  async startServer(data) {
    return await window.ipc.invoke(IPC_HANDLERS.SERVER, {
      func: IPC_FUNCTIONS.START_SERVER,
      data,
    });
  }

  async resetSession() {
    return await window.ipc.invoke(IPC_HANDLERS.WINDOW, {
      func: IPC_FUNCTIONS.RESET_SESSION,
    });
  }

  // Global hotkey methods

  /**
   * Register a global hotkey
   * @param {Object} hotkeyConfig - Configuration for the hotkey
   * @param {string} hotkeyConfig.id - Unique identifier for the hotkey
   * @param {Array} hotkeyConfig.keys - Array of keys that make up the hotkey
   * @param {string} hotkeyConfig.action - Action to perform when hotkey is triggered
   * @returns {Promise<Object>} Registration result
   */
  async registerGlobalHotkey(hotkeyConfig) {
    return await window.ipc.invoke(IPC_HANDLERS.HOTKEYS, {
      func: IPC_FUNCTIONS.REGISTER_GLOBAL_HOTKEY,
      data: hotkeyConfig,
    });
  }

  /**
   * Unregister a previously registered global hotkey
   * @param {string} hotkeyId - ID of the hotkey to unregister
   * @returns {Promise<Object>} Unregistration result
   */
  async unregisterGlobalHotkey(hotkeyId) {
    return await window.ipc.invoke(IPC_HANDLERS.HOTKEYS, {
      func: IPC_FUNCTIONS.UNREGISTER_GLOBAL_HOTKEY,
      data: { id: hotkeyId },
    });
  }

  /**
   * Unregister all global hotkeys
   * @returns {Promise<Object>} Unregistration result
   */
  async unregisterAllGlobalHotkeys() {
    return await window.ipc.invoke(IPC_HANDLERS.HOTKEYS, {
      func: IPC_FUNCTIONS.UNREGISTER_ALL_GLOBAL_HOTKEYS,
    });
  }

  /**
   * Check if a global hotkey is registered
   * @param {string} hotkeyId - ID of the hotkey to check
   * @returns {Promise<boolean>} Whether the hotkey is registered
   */
  async isGlobalHotkeyRegistered(hotkeyId) {
    return await window.ipc.invoke(IPC_HANDLERS.HOTKEYS, {
      func: IPC_FUNCTIONS.IS_GLOBAL_HOTKEY_REGISTERED,
      data: { id: hotkeyId },
    });
  }

  /**
   * Get all registered global hotkeys
   * @returns {Promise<Array>} List of registered global hotkeys
   */
  async getRegisteredGlobalHotkeys() {
    return await window.ipc.invoke(IPC_HANDLERS.HOTKEYS, {
      func: IPC_FUNCTIONS.GET_REGISTERED_GLOBAL_HOTKEYS,
    });
  }

  /**
   * Update an existing global hotkey
   * @param {Object} hotkeyConfig - Updated configuration for the hotkey
   * @param {string} hotkeyConfig.id - ID of the hotkey to update
   * @param {Array} hotkeyConfig.keys - New array of keys
   * @param {string} hotkeyConfig.action - New action to perform
   * @returns {Promise<Object>} Update result
   */
  async updateGlobalHotkey(hotkeyConfig) {
    return await window.ipc.invoke(IPC_HANDLERS.HOTKEYS, {
      func: IPC_FUNCTIONS.UPDATE_GLOBAL_HOTKEY,
      data: hotkeyConfig,
    });
  }
}
