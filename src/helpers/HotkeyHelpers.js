export default {
  findBinding(key, bindingConfig) {
    let keys = key.split(".");
    let bindingCursor = bindingConfig;
    for (const k of keys) {
      if (bindingCursor) {
        bindingCursor = bindingCursor?.[k];
      }
    }
    if (bindingCursor && bindingCursor.constructor === String) {
      return this.findBinding(bindingCursor, bindingConfig);
    }
    return bindingCursor || [];
  },

  printBindings(directBinding, bindingConfig) {
    if (directBinding.constructor === Array) {
      return directBinding.join(" + ").toUpperCase();
    } else {
      return this.findBinding(directBinding, bindingConfig)
        .join(" + ")
        .toUpperCase();
    }
  },

  focusField(refs, label) {
    const el = refs[label]?.$el || refs[label];
    let input = el.querySelector(".ProseMirror");
    if (!input) {
      input = el.querySelector(
        "input:not([type=hidden]),textarea:not([type=hidden])"
      );
    }
    if (input) {
      setTimeout(() => {
        input.focus();
      });
    }
  },

  /**
   * Converts app hotkey format to the format expected by node-global-key-listener
   * @param {Array} keys - Array of key strings (e.g., ['Ctrl', 'Shift', 'A'])
   * @returns {Object} - Object with key, modifiers info for global hotkey registration
   */
  convertToGlobalHotkeyFormat(keys) {
    if (!Array.isArray(keys) || keys.length === 0) {
      return null;
    }

    // The last element is usually the main key
    const mainKey = keys[keys.length - 1].toLowerCase();

    // All other elements are modifiers
    const modifiers = keys
      .slice(0, keys.length - 1)
      .map((mod) => mod.toLowerCase());

    return {
      key: mainKey,
      modifiers: {
        ctrl: modifiers.includes("ctrl"),
        alt: modifiers.includes("alt"),
        shift: modifiers.includes("shift"),
        meta:
          modifiers.includes("meta") ||
          modifiers.includes("cmd") ||
          modifiers.includes("command"),
      },
    };
  },

  /**
   * Registers global hotkeys from application's hotkey configuration
   * @param {Object} hotkeyConfig - The application's hotkey configuration
   * @param {Object} actions - Map of action names to handler functions
   */
  registerGlobalHotkeys(hotkeyConfig, actions) {
    // Check if we're in a renderer process with IPC access
    if (window.electron && window.electron.globalHotkeys) {
      const globalHotkeys = [];

      // Process the hotkey config to extract actions that should be globally available
      Object.entries(hotkeyConfig).forEach(([actionName, binding]) => {
        // Skip if the action doesn't exist or if the binding is a reference to another binding
        if (!actions[actionName] || typeof binding === "string") {
          return;
        }

        const keys = this.findBinding(actionName, hotkeyConfig);
        if (keys && keys.length > 0) {
          const globalFormat = this.convertToGlobalHotkeyFormat(keys);
          if (globalFormat) {
            globalHotkeys.push({
              ...globalFormat,
              actionName,
            });
          }
        }
      });

      // Register all global hotkeys at once
      if (globalHotkeys.length > 0) {
        window.electron.globalHotkeys.register(globalHotkeys);

        // Set up event listener for global hotkey triggers
        window.electron.globalHotkeys.onTrigger((actionName) => {
          if (actions[actionName]) {
            actions[actionName]();
          }
        });
      }
    }
  },

  /**
   * Updates global hotkey registrations when configuration changes
   * @param {Object} newHotkeyConfig - The updated hotkey configuration
   * @param {Object} actions - Map of action names to handler functions
   */
  updateGlobalHotkeys(newHotkeyConfig, actions) {
    if (window.electron && window.electron.globalHotkeys) {
      // First unregister all existing hotkeys
      this.unregisterGlobalHotkeys();

      // Then register with the new configuration
      this.registerGlobalHotkeys(newHotkeyConfig, actions);
    }
  },

  /**
   * Unregisters all global hotkeys
   */
  unregisterGlobalHotkeys() {
    if (window.electron && window.electron.globalHotkeys) {
      window.electron.globalHotkeys.unregisterAll();
    }
  },
};
