/**
 * GlobalHotkeyUtility.js
 *
 * Utility module for managing global hotkeys in the application.
 * Uses node-global-key-listener to register global keyboard shortcuts
 * that work outside the application window.
 */

const { GlobalKeyboardListener } = require("node-global-key-listener");
const { ipcMain } = require("electron");

class GlobalHotkeyUtility {
  constructor() {
    this.keyboardListener = new GlobalKeyboardListener();
    this.registeredHotkeys = new Map();
    this.isListening = false;
    this.modifierState = {
      shift: false,
      alt: false,
      ctrl: false,
      meta: false,
    };

    // Track modifier key states
    this.keyboardListener.addListener((e, down) => {
      if (e.name === "SHIFT") this.modifierState.shift = down;
      if (e.name === "ALT") this.modifierState.alt = down;
      if (e.name === "CONTROL") this.modifierState.ctrl = down;
      if (e.name === "META") this.modifierState.meta = down;
    });
  }

  /**
   * Start listening for global keyboard events
   */
  startListening() {
    if (this.isListening) return;

    this.keyboardListener.addListener((e, down) => {
      if (down) {
        this.handleKeyDown(e);
      }
    });

    this.isListening = true;
  }

  /**
   * Stop listening for global keyboard events
   */
  stopListening() {
    if (!this.isListening) return;

    this.keyboardListener.removeAllListeners();
    this.isListening = false;
  }

  /**
   * Handle key down events and trigger registered hotkey callbacks
   * @param {Object} event - Key event object from node-global-key-listener
   */
  handleKeyDown(event) {
    const currentKey = event.name;
    const activeModifiers = {
      shift: this.modifierState.shift,
      alt: this.modifierState.alt,
      ctrl: this.modifierState.ctrl,
      meta: this.modifierState.meta,
    };

    // Check each registered hotkey
    for (const [hotkey, callback] of this.registeredHotkeys.entries()) {
      const hotkeyParts = this.parseHotkey(hotkey);

      // Match key and all required modifiers
      if (
        hotkeyParts.key.toLowerCase() === currentKey.toLowerCase() &&
        (hotkeyParts.shift === activeModifiers.shift || !hotkeyParts.shift) &&
        (hotkeyParts.alt === activeModifiers.alt || !hotkeyParts.alt) &&
        (hotkeyParts.ctrl === activeModifiers.ctrl || !hotkeyParts.ctrl) &&
        (hotkeyParts.meta === activeModifiers.meta || !hotkeyParts.meta)
      ) {
        callback();
      }
    }
  }

  /**
   * Parse a hotkey string into its components
   * @param {string} hotkey - Hotkey string (e.g., "Ctrl+Shift+A")
   * @returns {Object} Object with key and modifier properties
   */
  parseHotkey(hotkey) {
    const parts = hotkey.split("+");
    const result = {
      shift: false,
      alt: false,
      ctrl: false,
      meta: false,
      key: "",
    };

    // The last part is usually the key
    result.key = parts[parts.length - 1];

    // Check for modifiers
    parts.forEach((part) => {
      const lowerPart = part.toLowerCase();
      if (lowerPart === "shift") result.shift = true;
      else if (lowerPart === "alt") result.shift = true;
      else if (lowerPart === "ctrl" || lowerPart === "control")
        result.ctrl = true;
      else if (
        lowerPart === "meta" ||
        lowerPart === "command" ||
        lowerPart === "cmd"
      )
        result.meta = true;
    });

    return result;
  }

  /**
   * Register a global hotkey
   * @param {string} hotkey - Hotkey combination (e.g., "Ctrl+Shift+A")
   * @param {Function} callback - Function to call when hotkey is triggered
   * @returns {boolean} Success status
   */
  register(hotkey, callback) {
    if (!hotkey || typeof callback !== "function") {
      console.error("Invalid hotkey registration parameters");
      return false;
    }

    try {
      // Store the hotkey and callback
      this.registeredHotkeys.set(hotkey, callback);

      // Make sure we're listening for keyboard events
      if (!this.isListening) {
        this.startListening();
      }

      return true;
    } catch (error) {
      console.error(`Error registering global hotkey ${hotkey}:`, error);
      return false;
    }
  }

  /**
   * Unregister a previously registered hotkey
   * @param {string} hotkey - The hotkey to unregister
   * @returns {boolean} Success status
   */
  unregister(hotkey) {
    if (!hotkey) {
      return false;
    }

    try {
      const result = this.registeredHotkeys.delete(hotkey);

      // If no more hotkeys are registered, stop listening
      if (this.registeredHotkeys.size === 0) {
        this.stopListening();
      }

      return result;
    } catch (error) {
      console.error(`Error unregistering global hotkey ${hotkey}:`, error);
      return false;
    }
  }

  /**
   * Unregister all hotkeys
   */
  unregisterAll() {
    this.registeredHotkeys.clear();
    this.stopListening();
  }

  /**
   * Setup IPC handlers for renderer process communication
   * @param {Electron.App} app - Electron app instance
   */
  setupIpcHandlers(app) {
    // Handle registration requests from renderer process
    ipcMain.handle("register-global-hotkey", (event, { hotkey, command }) => {
      return this.register(hotkey, () => {
        // Send command back to renderer to be executed
        event.sender.send("execute-hotkey-command", command);
      });
    });

    // Handle unregistration requests
    ipcMain.handle("unregister-global-hotkey", (event, { hotkey }) => {
      return this.unregister(hotkey);
    });

    // Clean up when app is about to quit
    app.on("will-quit", () => {
      this.unregisterAll();
    });
  }
}

module.exports = new GlobalHotkeyUtility();
