/* eslint-env jest */

// Define global variables
global.__DEV__ = true;

// Mock react-native
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: (obj) => obj.ios || obj.default || obj,
    },
    unstable_batchedUpdates: (callback) => callback(),
    UIManager: {},
    NativeModules: {},
  };
});

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const stores = new Map();

  const getStore = (id) => {
    if (!stores.has(id)) {
      stores.set(id, new Map());
    }
    return stores.get(id);
  };

  return {
    createMMKV: jest.fn().mockImplementation(({ id = 'default' } = {}) => {
      const storage = getStore(id);
      return {
        set: jest.fn((key, value) => storage.set(key, value)),
        getString: jest.fn((key) => storage.get(key)),
        remove: jest.fn((key) => storage.delete(key)),
        contains: jest.fn((key) => storage.has(key)),
        clearAll: jest.fn(() => storage.clear()),
        getAllKeys: jest.fn(() => Array.from(storage.keys())),
      };
    }),
  };
});
