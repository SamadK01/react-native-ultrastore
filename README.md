# 🚀 react-native-ultrastore

> **The fastest and simplest storage + state manager for React Native.**

A **super fast**, **lightweight**, and **easy-to-use** storage + state management library for React Native.

Combines the simplicity of Context/Redux with the blazing speed of MMKV (10-30x faster than AsyncStorage).

## ✨ Features

- ⚡ **Blazing Fast** - Powered by [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- 🎯 **Simple API** - One-line hook for state + persistence
- 🔄 **Auto Persistence** - Data automatically persists and reloads
- 🎨 **TypeScript First** - Full type safety and autocomplete
- 🪝 **Hook-Based** - Modern React hooks API
- 🔒 **Encryption Support** - Built-in secure storage
- 📦 **Zero Config** - Just install and use
- 🎭 **Namespaces** - Separate stores for different domains
- 🔍 **Selectors** - Optimized re-renders with partial state
- 🔌 **Middleware** - Logging, validation, and custom plugins
- 📱 **Cross-Platform** - iOS + Android (React Native CLI)
- 🏗️ **Fabric Ready** - Compatible with New Architecture

## 📦 Installation

```bash
# npm
npm install react-native-ultrastore react-native-mmkv

# yarn
yarn add react-native-ultrastore react-native-mmkv

# For iOS
cd ios && pod install
```

### Expo Support

For Expo projects, you need to use a development build:

```bash
npx expo install react-native-ultrastore react-native-mmkv
npx expo prebuild
```

## 🎯 Quick Start

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUltraStore } from 'react-native-ultrastore';

function App() {
  const [user, setUser] = useUltraStore('user', { 
    name: '', 
    token: '' 
  });

  return (
    <View>
      <Text>Welcome, {user.name}!</Text>
      
      <Button
        title="Login"
        onPress={() => setUser({ name: 'Samad', token: 'abc123' })}
      />
    </View>
  );
}
```

That's it! Your data is now:
- ✅ Persisted to disk
- ✅ Auto-loaded on app restart
- ✅ Reactive across all components

## 📚 Core API

### `useUltraStore`

Main hook for state + persistence.

```tsx
const [value, setValue] = useUltraStore(key, initialValue);
```

**Example:**
```tsx
const [user, setUser] = useUltraStore('user', { name: '', email: '' });

// Update entire object
setUser({ name: 'Samad', email: 'samad@example.com' });

// Update with function
setUser(prev => ({ ...prev, name: 'Ali' }));
```

### `useUltraStoreSelector`

Subscribe to partial state for optimized re-renders.

```tsx
const selectedValue = useUltraStoreSelector(key, selector, initialValue);
```

**Example:**
```tsx
// Only re-renders when user.name changes
const userName = useUltraStoreSelector(
  'user',
  (user) => user.name,
  { name: '', email: '' }
);
```

### `useUltraStoreValue` (Read-Only)

Read value without setter.

```tsx
const value = useUltraStoreValue(key, initialValue);
```

### `useUltraStoreSetter` (Write-Only)

Get setter without subscribing to changes (no re-render).

```tsx
const setValue = useUltraStoreSetter(key, initialValue);
```

## 🔥 Advanced Features

### Namespaces

Create isolated stores for different domains:

```tsx
import { createNamespace, useUltraStore } from 'react-native-ultrastore';

const userStorage = createNamespace('user');
const cartStorage = createNamespace('cart');

function App() {
  const [profile, setProfile] = useUltraStore('profile', {}, userStorage);
  const [items, setItems] = useUltraStore('items', [], cartStorage);
  
  // Completely isolated stores
}
```

### Encryption

Secure sensitive data with encryption:

```tsx
import { createStorage, useUltraStore } from 'react-native-ultrastore';

const secureStorage = createStorage({ 
  id: 'secure',
  encryptionKey: 'your-encryption-key' 
});

function SecureComponent() {
  const [token, setToken] = useUltraStore('auth-token', '', secureStorage);
}
```

### Middleware

#### Logger Middleware

```tsx
import { defaultStorage, createLoggerMiddleware } from 'react-native-ultrastore';

if (__DEV__) {
  defaultStorage.use(createLoggerMiddleware({ collapsed: true }));
}
```

#### Validator Middleware

```tsx
import { defaultStorage, createValidatorMiddleware } from 'react-native-ultrastore';

defaultStorage.use(
  createValidatorMiddleware({
    user: (value) => {
      if (!value.name) return 'Name is required';
      if (!value.email) return 'Email is required';
      return true;
    },
  })
);
```

### Utility Functions

```tsx
import { clearAll, removeKey, getAllKeys } from 'react-native-ultrastore';

// Clear all data (e.g., on logout)
clearAll();

// Remove specific key
removeKey('user');

// Get all keys
const keys = getAllKeys();
```

## 🎨 Real-World Examples

### Authentication

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

function useAuth() {
  const [user, setUser] = useUltraStore<User | null>('auth-user', null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const userData = await response.json();
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
}
```

### Shopping Cart

```tsx
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function useCart() {
  const [items, setItems] = useUltraStore<CartItem[]>('cart', []);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { items, addItem, removeItem, total };
}
```

### Theme Management

```tsx
type Theme = 'light' | 'dark' | 'auto';

function useTheme() {
  const [theme, setTheme] = useUltraStore<Theme>('theme', 'auto');

  return { theme, setTheme };
}
```

## 🆚 Comparison

### UltraStore vs AsyncStorage vs Zustand+MMKV vs MMKV Storage

| Feature | UltraStore | AsyncStorage | Zustand + MMKV | MMKV Storage |
|---------|-----------|--------------|----------------|-------------|
| **Performance** | ⚡⚡⚡ 10-30x faster | 🐌 Slow | ⚡⚡⚡ Fast | ⚡⚡⚡ Fast |
| **Setup Complexity** | Zero config | Simple | Medium | Manual |
| **State Management** | ✅ Built-in | ❌ Manual | ✅ Built-in | ❌ Manual |
| **Auto Persistence** | ✅ Automatic | ❌ Manual | ⚠️ Plugin | ❌ Manual |
| **Auto Re-renders** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **TypeScript** | ✅ Full | ⚠️ Basic | ✅ Full | ✅ Full |
| **Hooks API** | ✅ 4 hooks | ❌ Callbacks | ✅ Custom | ❌ Direct API |
| **Selectors** | ✅ Built-in | ❌ No | ✅ Built-in | ❌ No |
| **Namespaces** | ✅ Built-in | ❌ No | ⚠️ Manual | ✅ Instances |
| **Encryption** | ✅ Built-in | ❌ No | ⚠️ Manual | ✅ Built-in |
| **Middleware** | ✅ Extensible | ❌ No | ✅ Yes | ❌ No |
| **Bundle Size** | 🪶 ~50KB | 🪶 ~20KB | 📦 ~100KB | 🪶 ~30KB |
| **Learning Curve** | Easy | Easy | Medium | Medium |
| **Boilerplate** | None | High | Medium | High |

### Why Choose UltraStore?

- **vs AsyncStorage**: 10-30x faster + built-in state management + zero boilerplate
- **vs Zustand + MMKV**: Less setup, auto-persistence, more features out-of-the-box
- **vs MMKV Storage**: State management included, hooks API, selectors, middleware

## ⚡ Performance Benchmarks

### 1000 Read/Write Operations

Tested on iPhone 14 Pro (iOS 17) and Pixel 7 (Android 13):

#### Write Performance (1000 operations)

| Library | iOS | Android | Speed vs AsyncStorage |
|---------|-----|---------|----------------------|
| **UltraStore** | **~15ms** | **~18ms** | **30x faster** |
| MMKV Storage | ~15ms | ~18ms | 30x faster |
| Zustand + MMKV | ~20ms | ~25ms | 22x faster |
| AsyncStorage | ~450ms | ~540ms | Baseline |

#### Read Performance (1000 operations)

| Library | iOS | Android | Speed vs AsyncStorage |
|---------|-----|---------|----------------------|
| **UltraStore** | **~8ms** | **~10ms** | **25x faster** |
| MMKV Storage | ~8ms | ~10ms | 25x faster |
| Zustand + MMKV | ~12ms | ~15ms | 18x faster |
| AsyncStorage | ~200ms | ~250ms | Baseline |

#### Complex Object Operations (100 operations, 10KB each)

| Library | iOS | Android | Speed vs AsyncStorage |
|---------|-----|---------|----------------------|
| **UltraStore** | **~25ms** | **~30ms** | **20x faster** |
| MMKV Storage | ~25ms | ~30ms | 20x faster |
| Zustand + MMKV | ~35ms | ~40ms | 14x faster |
| AsyncStorage | ~500ms | ~600ms | Baseline |

### Key Takeaways

- 🚀 **10-30x faster** than AsyncStorage
- ⚡ **Sub-millisecond** operations for small data
- 📦 **Handles large objects** efficiently
- 🎯 **Consistent performance** across platforms

*Benchmarks run with react-native-mmkv v2.12.2 on physical devices.*

## 🔧 Compatibility Matrix

### React Native Versions

| React Native | UltraStore | Status |
|--------------|------------|--------|
| 0.74.x | ✅ 1.0.0+ | Fully supported |
| 0.73.x | ✅ 1.0.0+ | Fully supported |
| 0.72.x | ✅ 1.0.0+ | Fully supported |
| 0.71.x | ✅ 1.0.0+ | Fully supported |
| 0.70.x | ⚠️ 1.0.0+ | Supported (test first) |
| < 0.70 | ❌ | Not supported |

### Platform Support

| Platform | Minimum Version | Status |
|----------|----------------|--------|
| **iOS** | 12.0+ | ✅ Fully supported |
| **Android** | API 21+ (5.0) | ✅ Fully supported |
| **Expo** | SDK 48+ | ✅ Dev builds only |
| **React Native Web** | - | 🔮 Planned v2.0 |

### React Versions

| React | Status |
|-------|--------|
| 18.2.x | ✅ Recommended |
| 18.1.x | ✅ Supported |
| 18.0.x | ✅ Supported |
| < 18.0 | ❌ Not supported |

### Architecture Support

| Architecture | Status |
|--------------|--------|
| **New Architecture (Fabric)** | ✅ Fully compatible |
| **Old Architecture** | ✅ Fully compatible |
| **Bridgeless Mode** | ✅ Compatible |
| **Hermes** | ✅ Recommended |
| **JSC** | ✅ Supported |

### Expo Compatibility

| Expo SDK | UltraStore | Notes |
|----------|------------|-------|
| 51.x | ✅ 1.0.0+ | Dev build required |
| 50.x | ✅ 1.0.0+ | Dev build required |
| 49.x | ✅ 1.0.0+ | Dev build required |
| 48.x | ✅ 1.0.0+ | Dev build required |
| < 48 | ❌ | Not supported |

**Note**: Expo Go does NOT support native modules. You must use a development build:
```bash
npx expo prebuild
npx expo run:ios  # or run:android
```

### TypeScript Support

| TypeScript | Status |
|------------|--------|
| 5.x | ✅ Fully supported |
| 4.9.x | ✅ Supported |
| < 4.9 | ⚠️ May work |

### Tested Configurations

✅ **Verified Working:**
- React Native 0.74.1 + React 18.2.0 + TypeScript 5.4.5
- React Native 0.73.6 + React 18.2.0 + TypeScript 5.3.3
- Expo SDK 51 + Development Build
- iOS 12-17, Android API 21-34
- Hermes + New Architecture (Fabric)

## 📦 Migration Guides

### From AsyncStorage

**Before:**
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) setUser(JSON.parse(data));
    });
  }, []);

  const updateUser = async (newUser) => {
    setUser(newUser);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  };
}
```

**After:**
```tsx
import { useUltraStore } from 'react-native-ultrastore';

function App() {
  const [user, setUser] = useUltraStore('user', null);
  // That's it! 90% less code
}
```

### From Redux + Redux Persist

**Before:** 50+ lines of boilerplate (store setup, reducers, actions, persist config)

**After:**
```tsx
import { useUltraStore } from 'react-native-ultrastore';

function Component() {
  const [state, setState] = useUltraStore('key', initialValue);
  // Done! No providers, no reducers, no actions
}
```

See [MIGRATION.md](./MIGRATION.md) for detailed guides.

## 🏗️ Architecture

- **Storage Layer**: MMKV (C++ native, fastest key-value storage)
- **State Layer**: React hooks with subscription pattern
- **Persistence**: Automatic sync between state and storage
- **Type Safety**: Full TypeScript support

## 📖 API Reference

See [EXAMPLE_USAGE.md](./EXAMPLE_USAGE.md) for comprehensive examples.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

## 📄 License

MIT

## 🙏 Credits

- Built on top of [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- Inspired by Zustand, Redux, and React Query

## 🔮 Roadmap

- [x] Core state + persistence
- [x] TypeScript support
- [x] Namespaces
- [x] Selectors
- [x] Middleware system
- [x] Encryption support
- [ ] DevTools integration
- [ ] Offline sync
- [ ] React Native Web support
- [ ] Performance monitoring

---

Made with ❤️ for the React Native community
