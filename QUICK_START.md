# ⚡ Quick Start

Get started with react-native-ultrastore in 5 minutes.

## Installation

```bash
# Install packages
yarn add react-native-ultrastore react-native-mmkv

# iOS only
cd ios && pod install && cd ..
```

## Basic Usage

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUltraStore } from 'react-native-ultrastore';

function App() {
  const [count, setCount] = useUltraStore('count', 0);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 48 }}>{count}</Text>
      <Button title="+" onPress={() => setCount(c => c + 1)} />
    </View>
  );
}

export default App;
```

**That's it!** Your counter now:
- ✅ Persists across app restarts
- ✅ Updates instantly
- ✅ Works 10-30x faster than AsyncStorage

## Common Patterns

### User Authentication

```tsx
interface User {
  id: string;
  name: string;
  token: string;
}

function useAuth() {
  const [user, setUser] = useUltraStore<User | null>('auth-user', null);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

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
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { items, addItem, removeItem, total };
}
```

### Theme Management

```tsx
type Theme = 'light' | 'dark' | 'auto';

function useTheme() {
  const [theme, setTheme] = useUltraStore<Theme>('theme', 'light');
  return { theme, setTheme };
}
```

### Settings

```tsx
interface Settings {
  notifications: boolean;
  language: string;
  fontSize: number;
}

function useSettings() {
  const [settings, setSettings] = useUltraStore<Settings>('settings', {
    notifications: true,
    language: 'en',
    fontSize: 14,
  });

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
}
```

## Advanced Features

### Selectors (Performance)

```tsx
// Only re-renders when user.name changes
const userName = useUltraStoreSelector(
  'user',
  (user) => user.name,
  { name: '', email: '' }
);
```

### Namespaces (Isolation)

```tsx
import { createNamespace } from 'react-native-ultrastore';

const userStorage = createNamespace('user');
const cartStorage = createNamespace('cart');

const [profile, setProfile] = useUltraStore('data', {}, userStorage);
const [items, setItems] = useUltraStore('data', [], cartStorage);
```

### Encryption (Security)

```tsx
import { createStorage } from 'react-native-ultrastore';

const secureStorage = createStorage({
  id: 'secure',
  encryptionKey: 'your-secret-key'
});

const [token, setToken] = useUltraStore('auth-token', '', secureStorage);
```

### Debugging

```tsx
import { defaultStorage, createLoggerMiddleware } from 'react-native-ultrastore';

if (__DEV__) {
  defaultStorage.use(createLoggerMiddleware({ collapsed: true }));
}
```

## Utilities

```tsx
import { clearAll, removeKey, getAllKeys } from 'react-native-ultrastore';

// Clear all data (e.g., on logout)
clearAll();

// Remove specific key
removeKey('user');

// Get all keys
const keys = getAllKeys();
```

## Next Steps

- 📖 Read the [full documentation](./README.md)
- 🎨 Check out [more examples](./EXAMPLE_USAGE.md)
- 🚀 Run the [example app](./example/README.md)
- 📚 Explore the [API reference](./API.md)

## Need Help?

- 🐛 [Report Issues](https://github.com/yourusername/react-native-ultrastore/issues)
- 💬 [Discussions](https://github.com/yourusername/react-native-ultrastore/discussions)
- 📖 [Setup Guide](./SETUP_GUIDE.md)
