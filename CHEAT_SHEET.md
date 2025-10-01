# 📝 UltraStore Cheat Sheet

Quick reference for react-native-ultrastore.

## Installation

```bash
yarn add react-native-ultrastore react-native-mmkv
cd ios && pod install
```

## Basic Usage

```tsx
import { useUltraStore } from 'react-native-ultrastore';

const [value, setValue] = useUltraStore('key', initialValue);
```

## All Hooks

```tsx
// Main hook (state + persistence)
const [user, setUser] = useUltraStore('user', { name: '' });

// Selector (optimized re-renders)
const name = useUltraStoreSelector('user', u => u.name, { name: '' });

// Read-only
const user = useUltraStoreValue('user', { name: '' });

// Write-only
const setUser = useUltraStoreSetter('user', { name: '' });
```

## Common Patterns

### Counter
```tsx
const [count, setCount] = useUltraStore('count', 0);
setCount(c => c + 1);
```

### Auth
```tsx
const [user, setUser] = useUltraStore<User | null>('auth', null);
const login = (userData) => setUser(userData);
const logout = () => setUser(null);
```

### Cart
```tsx
const [items, setItems] = useUltraStore<Item[]>('cart', []);
const addItem = (item) => setItems(prev => [...prev, item]);
```

### Theme
```tsx
const [theme, setTheme] = useUltraStore<'light'|'dark'>('theme', 'light');
```

## Namespaces

```tsx
import { createNamespace } from 'react-native-ultrastore';

const userStorage = createNamespace('user');
const [data, setData] = useUltraStore('key', {}, userStorage);
```

## Encryption

```tsx
import { createStorage } from 'react-native-ultrastore';

const secure = createStorage({ encryptionKey: 'secret' });
const [token, setToken] = useUltraStore('token', '', secure);
```

## Middleware

```tsx
import { defaultStorage, createLoggerMiddleware } from 'react-native-ultrastore';

defaultStorage.use(createLoggerMiddleware({ collapsed: true }));
```

## Utilities

```tsx
import { clearAll, removeKey, getAllKeys } from 'react-native-ultrastore';

clearAll();              // Clear everything
removeKey('user');       // Remove specific key
const keys = getAllKeys(); // Get all keys
```

## TypeScript

```tsx
interface User {
  id: string;
  name: string;
}

const [user, setUser] = useUltraStore<User>('user', {
  id: '',
  name: '',
});
```

## Performance Tips

1. Use selectors for large objects
2. Use write-only hooks when you don't need the value
3. Use namespaces to separate concerns
4. Keep values under 1MB
5. Only encrypt sensitive data

## Troubleshooting

### iOS Build Error
```bash
cd ios && rm -rf Pods && pod install
```

### Android Build Error
```bash
cd android && ./gradlew clean
```

### Expo Error
```bash
npx expo prebuild
npx expo run:ios
```

## Links

- 📖 [Full Docs](./README.md)
- 🚀 [Quick Start](./QUICK_START.md)
- 📚 [API Reference](./API.md)
- ⚡ [Benchmarks](./BENCHMARKS.md)
