const { contextBridge, ipcRenderer, webFrame } = require("electron");
window.ipcRenderer = ipcRenderer;

contextBridge.exposeInMainWorld("ipc", {
  invoke: async (channel, data) => {
    return await ipcRenderer.invoke(channel, data);
  },
  on: (channel, func) => {
    // Remove any old listeners
    ipcRenderer.removeAllListeners(channel);
    // Strip event as it includes `sender` and is a security risk
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  clearCache: () => {
    webFrame.clearCache();
  },
  eventNames: () => {
    return ipcRenderer.eventNames();
  },
  // Add global hotkey related methods
  registerGlobalHotkey: async (accelerator, id) => {
    return await ipcRenderer.invoke("register-global-hotkey", {
      accelerator,
      id,
    });
  },
  unregisterGlobalHotkey: async (id) => {
    return await ipcRenderer.invoke("unregister-global-hotkey", id);
  },
  unregisterAllGlobalHotkeys: async () => {
    return await ipcRenderer.invoke("unregister-all-global-hotkeys");
  },
  isGlobalHotkeyRegistered: async (id) => {
    return await ipcRenderer.invoke("is-global-hotkey-registered", id);
  },
  getRegisteredGlobalHotkeys: async () => {
    return await ipcRenderer.invoke("get-registered-global-hotkeys");
  },
});
