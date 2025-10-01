# 📦 react-native-ultrastore - Project Overview

## 🎯 Project Summary

**react-native-ultrastore** is a production-ready, advanced React Native library that combines **state management** with **persistent storage** using MMKV as the backend. It's designed to replace AsyncStorage, Redux, and Context API with a simpler, faster, and more developer-friendly solution.

## ✨ Key Features

### Core Features (v1.0.0)
- ⚡ **Blazing Fast**: 10-30x faster than AsyncStorage (powered by MMKV)
- 🎯 **Simple API**: One-line hook for state + persistence
- 🔄 **Auto Persistence**: Data automatically persists and reloads
- 🎨 **TypeScript First**: Full type safety and autocomplete
- 🪝 **Hook-Based**: Modern React hooks API
- 📦 **Zero Config**: Just install and use
- 📱 **Cross-Platform**: iOS + Android (React Native CLI)
- 🏗️ **Fabric Ready**: Compatible with New Architecture

### Advanced Features
- 🔒 **Encryption Support**: Built-in secure storage for sensitive data
- 🎭 **Namespaces**: Separate stores for different domains
- 🔍 **Selectors**: Optimized re-renders with partial state subscription
- 🔌 **Middleware System**: Logging, validation, and custom plugins
- 📊 **Performance Optimized**: Read-only and write-only hooks
- 🛠️ **Utility Functions**: clearAll, removeKey, getAllKeys

## 📁 Project Structure

```
react-native-ultrastore/
├── src/                          # Source code
│   ├── hooks/                    # React hooks
│   │   ├── useUltraStore.ts      # Main hook (state + persistence)
│   │   ├── useUltraStoreSelector.ts  # Selector hook (optimized)
│   │   ├── useUltraStoreValue.ts     # Read-only hook
│   │   └── useUltraStoreSetter.ts    # Write-only hook
│   ├── middlewares/              # Middleware implementations
│   │   ├── logger.ts             # Debug logging
│   │   └── validator.ts          # Data validation
│   ├── utils/                    # Utility functions
│   │   ├── createNamespace.ts    # Namespace creation
│   │   ├── clearAll.ts           # Clear all data
│   │   ├── removeKey.ts          # Remove specific key
│   │   └── getAllKeys.ts         # Get all keys
│   ├── __tests__/                # Unit tests
│   │   ├── storage.test.ts       # Storage engine tests
│   │   └── store.test.ts         # Store tests
│   ├── storage.ts                # Storage engine (MMKV wrapper)
│   ├── store.ts                  # State management core
│   ├── types.ts                  # TypeScript types
│   └── index.ts                  # Main entry point
│
├── example/                      # Example React Native CLI app
│   ├── App.tsx                   # Demo app with all features
│   ├── package.json              # Example dependencies
│   └── README.md                 # Example documentation
│
├── docs/                         # Documentation
│   ├── README.md                 # Main documentation
│   ├── API.md                    # API reference
│   ├── QUICK_START.md            # Quick start guide
│   ├── SETUP_GUIDE.md            # Detailed setup guide
│   ├── EXAMPLE_USAGE.md          # Usage examples
│   ├── MIGRATION.md              # Migration guide
│   └── CONTRIBUTING.md           # Contribution guidelines
│
├── package.json                  # Package configuration
├── tsconfig.json                 # TypeScript config
├── tsconfig.build.json           # Build TypeScript config
├── jest.config.js                # Jest configuration
├── jest.setup.js                 # Jest setup
├── .eslintrc.js                  # ESLint config
├── .prettierrc.js                # Prettier config
├── .release-it.json              # Release config
├── CHANGELOG.md                  # Version history
└── LICENSE                       # MIT License
```

## 🏗️ Architecture

### 1. Storage Layer (`storage.ts`)
- Wraps `react-native-mmkv` for high-performance storage
- Provides middleware support
- Handles JSON serialization/deserialization
- Supports encryption

### 2. State Layer (`store.ts`)
- Manages reactive state with subscription pattern
- Maintains singleton stores per key
- Syncs state with storage automatically
- Notifies listeners on changes

### 3. Hook Layer (`hooks/`)
- `useUltraStore`: Main hook (state + persistence)
- `useUltraStoreSelector`: Optimized partial state subscription
- `useUltraStoreValue`: Read-only access
- `useUltraStoreSetter`: Write-only updates

### 4. Middleware System
- Logger: Debug logging for development
- Validator: Data validation before storage
- Custom: Extensible middleware API

## 🔧 Technical Details

### Dependencies
- **react-native-mmkv**: ^2.12.2 (core storage engine)
- **react**: ^18.2.0 (peer dependency)
- **react-native**: ^0.74.0+ (peer dependency)

### Build System
- **TypeScript**: Full type safety
- **react-native-builder-bob**: Library builder
- **Jest**: Unit testing
- **ESLint + Prettier**: Code quality

### Compatibility
- React Native: 0.74.0+
- React: 18.0.0+
- iOS: 12.0+
- Android: API 21+ (Android 5.0+)
- New Architecture (Fabric): ✅ Compatible
- Expo: ✅ With development builds

## 📊 Performance

### Benchmarks (vs AsyncStorage)
- **Read**: 10-30x faster
- **Write**: 10-30x faster
- **Bundle Size**: ~50KB (minified)
- **Memory**: Minimal overhead

### Optimization Features
- Selectors for partial state updates
- Read-only/write-only hooks to prevent unnecessary re-renders
- Efficient subscription pattern
- Native C++ backend (MMKV)

## 🎓 Usage Examples

### Basic Usage
```tsx
const [user, setUser] = useUltraStore('user', { name: '', email: '' });
```

### With Selectors
```tsx
const userName = useUltraStoreSelector('user', (u) => u.name, { name: '' });
```

### With Namespaces
```tsx
const userStorage = createNamespace('user');
const [profile, setProfile] = useUltraStore('data', {}, userStorage);
```

### With Encryption
```tsx
const secureStorage = createStorage({ encryptionKey: 'secret' });
const [token, setToken] = useUltraStore('token', '', secureStorage);
```

## 🧪 Testing

```bash
# Run tests
yarn test

# Type checking
yarn typecheck

# Linting
yarn lint
```

## 📦 Publishing

```bash
# Build library
yarn prepare

# Publish to npm
yarn release
```

## 🗺️ Roadmap

### v1.0.0 (Current) ✅
- Core state + persistence
- TypeScript support
- Namespaces
- Selectors
- Middleware system
- Encryption support
- Documentation
- Tests

### v1.1.0 (Planned)
- [ ] DevTools integration
- [ ] Performance monitoring
- [ ] Advanced selectors (deep comparison)
- [ ] Batch updates

### v2.0.0 (Future)
- [ ] Offline sync with server
- [ ] React Native Web support
- [ ] Multi-tab sync
- [ ] Time-travel debugging
- [ ] Schema validation
- [ ] Migration utilities

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file.

## 🙏 Credits

- Built on [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- Inspired by Zustand, Redux, and React Query
- Created for the React Native community

## 📞 Support

- 📖 [Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/yourusername/react-native-ultrastore/issues)
- 💬 [Discussions](https://github.com/yourusername/react-native-ultrastore/discussions)
- 📧 Email: your.email@example.com

---

**Made with ❤️ for React Native developers**
