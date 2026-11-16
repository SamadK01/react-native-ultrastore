const {
  withPlugins,
  withPodfileProperties,
  withGradleProperties,
} = require('@expo/config-plugins');

const withUltraStoreIOS = (config) => {
  return withPodfileProperties(config, (mod) => {
    mod.modResults['ios.newArchEnabled'] = 'true';
    return mod;
  });
};

const withUltraStoreAndroid = (config) => {
  return withGradleProperties(config, (mod) => {
    const existing = mod.modResults.find(
      (item) => item.type === 'property' && item.key === 'newArchEnabled'
    );
    if (existing) {
      existing.value = 'true';
    } else {
      mod.modResults.push({
        type: 'property',
        key: 'newArchEnabled',
        value: 'true',
      });
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

  return withPlugins(config, [withUltraStoreIOS, withUltraStoreAndroid]);
};

module.exports = withUltraStore;
