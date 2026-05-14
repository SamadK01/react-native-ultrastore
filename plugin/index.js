const { withPlugins, withPodfileProperties, withGradleProperties } = require('@expo/config-plugins');

/**
 * UltraStore Expo Config Plugin
 * Automatically configures MMKV for production Expo builds.
 *
 * Usage in app.json / app.config.js:
 * {
 *   "plugins": [
 *     ["react-native-ultrastore", { "enableNewArchitecture": true }]
 *   ]
 * }
 */

const withUltraStoreIOS = (config) => {
  return withPodfileProperties(config, (mod) => {
    // Enable New Architecture for MMKV v4
    mod.modResults['ios.newArchEnabled'] = 'true';
    return mod;
  });
};

const withUltraStoreAndroid = (config) => {
  return withGradleProperties(config, (mod) => {
    // Enable New Architecture for MMKV v4
    const existing = mod.modResults.find(
      (item) => item.type === 'property' && item.key === 'newArchEnabled'
    );
    if (existing) {
      existing.value = 'true';
    } else {
      mod.modResults.push({ type: 'property', key: 'newArchEnabled', value: 'true' });
    }
    return mod;
  });
};

/**
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @param {{ enableNewArchitecture?: boolean }} options
 */
const withUltraStore = (config, options = {}) => {
  const { enableNewArchitecture = true } = options;

  if (!enableNewArchitecture) {
    console.warn(
      '[UltraStore] Warning: MMKV v4 requires New Architecture. ' +
      'Set enableNewArchitecture: true or use the Expo Go fallback (AsyncStorage).'
    );
    return config;
  }

  return withPlugins(config, [
    withUltraStoreIOS,
    withUltraStoreAndroid,
  ]);
};

module.exports = withUltraStore;
