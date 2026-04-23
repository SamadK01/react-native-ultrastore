const Platform = {
  OS: 'ios',
  select: (obj) => obj.default || obj.ios || obj,
};

const UIManager = {};
const NativeModules = {};

module.exports = {
  Platform,
  UIManager,
  NativeModules,
};

module.exports.Platform = Platform;
module.exports.UIManager = UIManager;
module.exports.NativeModules = NativeModules;
module.exports.default = module.exports;
