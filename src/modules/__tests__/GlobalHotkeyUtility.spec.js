import { GlobalHotkeyUtility } from "../GlobalHotkeyUtility";
import { IGlobalKeyListener } from "node-global-key-listener";

// Mock the node-global-key-listener module
jest.mock("node-global-key-listener", () => {
  return {
    IGlobalKeyListener: jest.fn().mockImplementation(() => {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    }),
  };
});

describe("GlobalHotkeyUtility", () => {
  let globalHotkeyUtility;
  let mockCallback;
  let mockKeyListener;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup utility and mocks
    globalHotkeyUtility = new GlobalHotkeyUtility();
    mockCallback = jest.fn();
    mockKeyListener = IGlobalKeyListener.mock.instances[0];
  });

  test("should initialize with no hotkeys registered", () => {
    expect(globalHotkeyUtility.registeredHotkeys).toEqual({});
    expect(IGlobalKeyListener).toHaveBeenCalled();
  });

  test("should register a hotkey successfully", () => {
    const hotkey = {
      key: "A",
      modifier: "ctrl",
      id: "test-hotkey",
    };

    globalHotkeyUtility.registerHotkey(hotkey, mockCallback);

    expect(mockKeyListener.addListener).toHaveBeenCalled();
    expect(globalHotkeyUtility.registeredHotkeys).toHaveProperty("test-hotkey");
    expect(globalHotkeyUtility.registeredHotkeys["test-hotkey"].callback).toBe(
      mockCallback
    );
  });

  test("should register a complex hotkey with multiple modifiers", () => {
    const hotkey = {
      key: "B",
      modifier: "ctrl+shift",
      id: "complex-hotkey",
    };

    globalHotkeyUtility.registerHotkey(hotkey, mockCallback);

    expect(mockKeyListener.addListener).toHaveBeenCalled();
    expect(globalHotkeyUtility.registeredHotkeys).toHaveProperty(
      "complex-hotkey"
    );
  });

  test("should unregister a hotkey successfully", () => {
    // First register a hotkey
    const hotkey = {
      key: "C",
      modifier: "alt",
      id: "to-unregister",
    };

    globalHotkeyUtility.registerHotkey(hotkey, mockCallback);
    expect(globalHotkeyUtility.registeredHotkeys).toHaveProperty(
      "to-unregister"
    );

    // Then unregister it
    globalHotkeyUtility.unregisterHotkey("to-unregister");

    expect(mockKeyListener.removeListener).toHaveBeenCalled();
    expect(globalHotkeyUtility.registeredHotkeys).not.toHaveProperty(
      "to-unregister"
    );
  });

  test("should handle unregister of non-existent hotkey", () => {
    globalHotkeyUtility.unregisterHotkey("non-existent");
    expect(mockKeyListener.removeListener).not.toHaveBeenCalled();
  });

  test("should unregister all hotkeys", () => {
    // Register multiple hotkeys
    globalHotkeyUtility.registerHotkey(
      {
        key: "D",
        modifier: "ctrl",
        id: "hotkey1",
      },
      mockCallback
    );

    globalHotkeyUtility.registerHotkey(
      {
        key: "E",
        modifier: "shift",
        id: "hotkey2",
      },
      mockCallback
    );

    expect(Object.keys(globalHotkeyUtility.registeredHotkeys).length).toBe(2);

    // Unregister all
    globalHotkeyUtility.unregisterAllHotkeys();

    expect(mockKeyListener.removeListener).toHaveBeenCalledTimes(2);
    expect(globalHotkeyUtility.registeredHotkeys).toEqual({});
  });

  test("should trigger callback when hotkey is pressed", () => {
    // Mock the key listener to capture the event handler
    let capturedHandler;
    mockKeyListener.addListener.mockImplementation((handler) => {
      capturedHandler = handler;
      return jest.fn();
    });

    const hotkey = {
      key: "F",
      modifier: "ctrl",
      id: "trigger-test",
    };

    globalHotkeyUtility.registerHotkey(hotkey, mockCallback);

    // Simulate key event that should trigger the hotkey
    const mockKeyEvent = {
      name: "F",
      state: "DOWN",
      ctrl: true,
      shift: false,
      alt: false,
    };

    capturedHandler(null, mockKeyEvent);
    expect(mockCallback).toHaveBeenCalled();
  });

  test("should not trigger callback for non-matching key", () => {
    // Mock the key listener to capture the event handler
    let capturedHandler;
    mockKeyListener.addListener.mockImplementation((handler) => {
      capturedHandler = handler;
      return jest.fn();
    });

    const hotkey = {
      key: "G",
      modifier: "ctrl",
      id: "no-trigger-test",
    };

    globalHotkeyUtility.registerHotkey(hotkey, mockCallback);

    // Simulate key event with wrong key
    const mockKeyEvent = {
      name: "H", // Different key
      state: "DOWN",
      ctrl: true,
      shift: false,
      alt: false,
    };

    capturedHandler(null, mockKeyEvent);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
