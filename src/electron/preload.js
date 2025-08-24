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
});
