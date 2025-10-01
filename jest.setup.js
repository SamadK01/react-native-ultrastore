// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const storage = new Map();

  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn((key, value) => storage.set(key, value)),
      getString: jest.fn((key) => storage.get(key)),
      delete: jest.fn((key) => storage.delete(key)),
      contains: jest.fn((key) => storage.has(key)),
      clearAll: jest.fn(() => storage.clear()),
      getAllKeys: jest.fn(() => Array.from(storage.keys())),
    })),
  };
});
