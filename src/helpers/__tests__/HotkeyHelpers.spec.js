import {
  parseHotkey,
  generateUniqueId,
  formatHotkeyForDisplay,
  isGlobalHotkeySupported,
  buildGlobalHotkey,
} from "../HotkeyHelpers";

describe("HotkeyHelpers", () => {
  describe("parseHotkey", () => {
    test("should parse a simple hotkey correctly", () => {
      const parsed = parseHotkey("Ctrl+A");

      expect(parsed).toEqual({
        key: "A",
        modifier: "ctrl",
        original: "Ctrl+A",
      });
    });

    test("should parse a hotkey with multiple modifiers correctly", () => {
      const parsed = parseHotkey("Ctrl+Shift+B");

      expect(parsed).toEqual({
        key: "B",
        modifier: "ctrl+shift",
        original: "Ctrl+Shift+B",
      });
    });

    test("should handle lowercase input correctly", () => {
      const parsed = parseHotkey("ctrl+c");

      expect(parsed).toEqual({
        key: "C",
        modifier: "ctrl",
        original: "ctrl+c",
      });
    });

    test("should return null for invalid hotkey format", () => {
      const parsed = parseHotkey("InvalidHotkey");
      expect(parsed).toBeNull();
    });
  });

  describe("generateUniqueId", () => {
    test("should generate a unique ID based on the hotkey", () => {
      const id = generateUniqueId({
        key: "A",
        modifier: "ctrl",
        original: "Ctrl+A",
      });

      expect(id).toContain("ctrl");
      expect(id).toContain("A");
      expect(typeof id).toBe("string");
    });

    test("should generate different IDs for different hotkeys", () => {
      const id1 = generateUniqueId({
        key: "A",
        modifier: "ctrl",
        original: "Ctrl+A",
      });

      const id2 = generateUniqueId({
        key: "B",
        modifier: "shift",
        original: "Shift+B",
      });

      expect(id1).not.toEqual(id2);
    });
  });

  describe("formatHotkeyForDisplay", () => {
    test("should format a hotkey for display with standard modifiers", () => {
      const formatted = formatHotkeyForDisplay("Ctrl+A");

      // The exact format may depend on platform, but should include both parts
      expect(formatted).toContain("Ctrl");
      expect(formatted).toContain("A");
    });

    test("should handle multiple modifiers in display format", () => {
      const formatted = formatHotkeyForDisplay("Ctrl+Shift+B");

      expect(formatted).toContain("Ctrl");
      expect(formatted).toContain("Shift");
      expect(formatted).toContain("B");
    });
  });

  describe("isGlobalHotkeySupported", () => {
    test("should return true for valid global hotkeys", () => {
      expect(isGlobalHotkeySupported("Ctrl+A")).toBe(true);
      expect(isGlobalHotkeySupported("Alt+Shift+F")).toBe(true);
    });

    test("should return false for unsupported hotkeys", () => {
      expect(isGlobalHotkeySupported("F11")).toBe(false); // No modifier
      expect(isGlobalHotkeySupported("Invalid+Format")).toBe(false);
    });
  });

  describe("buildGlobalHotkey", () => {
    test("should build a global hotkey object with ID", () => {
      const hotkey = buildGlobalHotkey("Ctrl+D", "action-name");

      expect(hotkey).toHaveProperty("key", "D");
      expect(hotkey).toHaveProperty("modifier", "ctrl");
      expect(hotkey).toHaveProperty("id");
      expect(hotkey.id).toContain("action-name");
    });

    test("should include the action name in the ID", () => {
      const hotkey = buildGlobalHotkey("Alt+F", "test-action");

      expect(hotkey.id).toContain("test-action");
    });

    test("should return null for invalid hotkey formats", () => {
      const hotkey = buildGlobalHotkey("InvalidFormat", "action");
      expect(hotkey).toBeNull();
    });

    test("should return null for unsupported global hotkeys", () => {
      // Mock isGlobalHotkeySupported to return false
      const originalImplementation = isGlobalHotkeySupported;
      global.isGlobalHotkeySupported = jest.fn(() => false);

      const hotkey = buildGlobalHotkey("F12", "action");
      expect(hotkey).toBeNull();

      // Restore original implementation
      global.isGlobalHotkeySupported = originalImplementation;
    });
  });
});
