import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import VTiptap from "@yatt-ai/vuetify-tiptap";
import router from "./router";
import store from "./store";
import integrationHelpers from "./integrations/IntegrationHelpers";
import hotkeyHelpers from "./helpers/HotkeyHelpers";
import { app, ipcMain } from "electron";
import { GlobalHotkeyUtility } from "./modules/GlobalHotkeyUtility";

import DefaultLayout from "./layouts/Default.vue";
import MinimizeLayout from "./layouts/Minimize.vue";

import VueShortkey from "vue-shortkey";

import VueMask from "v-mask";
import i18n from "./i18n";
import StorageService from "./services/storageService";
import ElectronService from "@/services/electronService";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faTableList } from "@fortawesome/free-solid-svg-icons";

library.add(faComment);
library.add(faTriangleExclamation);
library.add(faClipboard);
library.add(faLightbulb);
library.add(faCircleQuestion);
library.add(faBookmark);
library.add(faPlus);
library.add(faTableList);

Vue.use(VueShortkey);
Vue.use(VTiptap);
Vue.use(VueMask);

Vue.component("default-layout", DefaultLayout);
Vue.component("minimize-layout", MinimizeLayout);
Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

const isElectronApp = navigator.userAgent.includes("Electron");

// Initialize GlobalHotkeyUtility for Electron app
let globalHotkeyUtility = null;

if (isElectronApp && process.type === "browser") {
  // Initialize the global hotkey utility in the main process only
  globalHotkeyUtility = new GlobalHotkeyUtility();

  // Set up IPC handlers for global hotkeys
  ipcMain.handle("register-global-hotkey", async (event, hotkeyConfig) => {
    try {
      const result = await globalHotkeyUtility.registerHotkey(hotkeyConfig);
      return { success: true, id: result.id };
    } catch (error) {
      console.error("Failed to register global hotkey:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("unregister-global-hotkey", async (event, hotkeyId) => {
    try {
      await globalHotkeyUtility.unregisterHotkey(hotkeyId);
      return { success: true };
    } catch (error) {
      console.error("Failed to unregister global hotkey:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("unregister-all-global-hotkeys", async () => {
    try {
      await globalHotkeyUtility.unregisterAllHotkeys();
      return { success: true };
    } catch (error) {
      console.error("Failed to unregister all global hotkeys:", error);
      return { success: false, error: error.message };
    }
  });

  // Clean up global hotkeys when the app is about to quit
  app.on("will-quit", () => {
    console.log("Application is quitting, cleaning up global hotkeys...");
    if (globalHotkeyUtility) {
      try {
        globalHotkeyUtility.unregisterAllHotkeys();
        globalHotkeyUtility.dispose(); // Ensure any listeners or resources are cleaned up
        globalHotkeyUtility = null;
        console.log("Successfully cleaned up all global hotkeys");
      } catch (error) {
        console.error(
          "Error cleaning up global hotkeys during app exit:",
          error
        );
      }
    }
  });

  // Also clean up on before-quit event to ensure we don't miss anything
  app.on("before-quit", () => {
    console.log(
      "Before application quit, ensuring global hotkeys are cleaned up..."
    );
    if (globalHotkeyUtility) {
      try {
        globalHotkeyUtility.unregisterAllHotkeys();
      } catch (error) {
        console.error(
          "Error cleaning up global hotkeys before app quit:",
          error
        );
      }
    }
  });

  // Additional cleanup on window-all-closed event
  app.on("window-all-closed", () => {
    console.log("All windows closed, performing cleanup...");
    // Only perform cleanup if we're not on macOS (as the app stays running)
    if (process.platform !== "darwin" && globalHotkeyUtility) {
      try {
        globalHotkeyUtility.unregisterAllHotkeys();
      } catch (error) {
        console.error(
          "Error cleaning up global hotkeys when all windows closed:",
          error
        );
      }
    }
  });
}

const plugins = {
  install() {
    Vue.integrationHelpers = integrationHelpers;
    Vue.prototype.$integrationHelpers = integrationHelpers;
    Vue.hotkeyHelpers = hotkeyHelpers;
    Vue.prototype.$hotkeyHelpers = hotkeyHelpers;
    Vue.prototype.$isElectron = isElectronApp;
    Vue.prototype.$storageService = new StorageService();
    if (isElectronApp) {
      Vue.prototype.$electronService = new ElectronService();
    }
  },
};
Vue.use(plugins);

new Vue({
  vuetify,
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
