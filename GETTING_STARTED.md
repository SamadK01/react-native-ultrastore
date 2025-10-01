# 🚀 Getting Started with react-native-ultrastore

Welcome! This guide will help you get started with UltraStore in your React Native project.

## Prerequisites

- Node.js 18+
- React Native 0.74+
- React 18+
- iOS 12+ / Android API 21+

## Installation

### Step 1: Install Packages

```bash
# Using yarn (recommended)
yarn add react-native-ultrastore react-native-mmkv

# Using npm
npm install react-native-ultrastore react-native-mmkv
```

### Step 2: iOS Setup

```bash
cd ios
pod install
cd ..
```

### Step 3: Start Using!

No configuration needed. Just import and use:

```tsx
import { useUltraStore } from 'react-native-ultrastore';

function App() {
  const [count, setCount] = useUltraStore('count', 0);
  
  return (
    <View>
      <Text>{count}</Text>
      <Button title="+" onPress={() => setCount(c => c + 1)} />
    </View>
  );
}
```

## Your First Store

Let's build a simple user profile manager:

```tsx
import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useUltraStore } from 'react-native-ultrastore';

interface User {
  name: string;
  email: string;
}

function ProfileScreen() {
  const [user, setUser] = useUltraStore<User>('user-profile', {
    name: '',
    email: '',
  });

  const [tempName, setTempName] = React.useState(user.name);
  const [tempEmail, setTempEmail] = React.useState(user.email);

  const handleSave = () => {
    setUser({ name: tempName, email: tempEmail });
    alert('Profile saved!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={tempName}
        onChangeText={setTempName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={tempEmail}
        onChangeText={setTempEmail}
      />
      
      <Button title="Save Profile" onPress={handleSave} />
      
      {user.name && (
        <View style={styles.preview}>
          <Text>Saved Profile:</Text>
          <Text>Name: {user.name}</Text>
          <Text>Email: {user.email}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  preview: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});

export default ProfileScreen;
```

**Try it:**
1. Enter your name and email
2. Press "Save Profile"
3. Close and reopen the app
4. Your data is still there! 🎉

## Common Use Cases

### 1. Authentication

```tsx
interface User {
  id: string;
  name: string;
  token: string;
}

function useAuth() {
  const [user, setUser] = useUltraStore<User | null>('auth-user', null);

  const login = async (email: string, password: string) => {
    // Your login logic
    const userData = await api.login(email, password);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };
}

// Usage
function App() {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return <HomeScreen user={user} onLogout={logout} />;
}
```

### 2. Shopping Cart

```tsx
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function useCart() {
  const [items, setItems] = useUltraStore<CartItem[]>('shopping-cart', []);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount: items.length,
  };
}
```

### 3. Theme Management

```tsx
type Theme = 'light' | 'dark' | 'auto';

function useTheme() {
  const [theme, setTheme] = useUltraStore<Theme>('app-theme', 'light');

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  return { theme, setTheme, toggleTheme };
}
```

### 4. App Settings

```tsx
interface AppSettings {
  notifications: boolean;
  language: string;
  fontSize: number;
  autoSave: boolean;
}

function useSettings() {
  const [settings, setSettings] = useUltraStore<AppSettings>('app-settings', {
    notifications: true,
    language: 'en',
    fontSize: 14,
    autoSave: true,
  });

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
}
```

## Advanced Features

### Performance Optimization with Selectors

```tsx
// ❌ Bad: Re-renders on ANY user change
function UserName() {
  const [user] = useUltraStore('user', { name: '', email: '', age: 0 });
  return <Text>{user.name}</Text>;
}

// ✅ Good: Only re-renders when name changes
import { useUltraStoreSelector } from 'react-native-ultrastore';

function UserName() {
  const name = useUltraStoreSelector(
    'user',
    (user) => user.name,
    { name: '', email: '', age: 0 }
  );
  return <Text>{name}</Text>;
}
```

### Separate Concerns with Namespaces

```tsx
import { createNamespace } from 'react-native-ultrastore';

// Create isolated storage instances
const userStorage = createNamespace('user');
const cartStorage = createNamespace('cart');
const settingsStorage = createNamespace('settings');

// Use them independently
const [user, setUser] = useUltraStore('data', {}, userStorage);
const [cart, setCart] = useUltraStore('data', [], cartStorage);
const [settings, setSettings] = useUltraStore('data', {}, settingsStorage);
```

### Secure Sensitive Data

```tsx
import { createStorage } from 'react-native-ultrastore';

// Create encrypted storage
const secureStorage = createStorage({
  id: 'secure-storage',
  encryptionKey: 'your-encryption-key-here',
});

// Store sensitive data
const [authToken, setAuthToken] = useUltraStore('token', '', secureStorage);
const [apiKey, setApiKey] = useUltraStore('api-key', '', secureStorage);
```

## Debugging

Enable logging in development:

```tsx
import { defaultStorage, createLoggerMiddleware } from 'react-native-ultrastore';

if (__DEV__) {
  defaultStorage.use(createLoggerMiddleware({
    collapsed: true,
    colors: true,
  }));
}
```

Now you'll see all storage operations in the console!

## Testing Your App

Close and reopen your app to verify persistence:

1. Add some data
2. Close the app completely
3. Reopen the app
4. Your data should still be there! ✅

## Next Steps

- 📖 Read the [full documentation](./README.md)
- 🎨 Explore [more examples](./EXAMPLE_USAGE.md)
- 📚 Check the [API reference](./API.md)
- 🚀 Run the [example app](./example/README.md)

## Need Help?

- 🐛 [Report Issues](https://github.com/yourusername/react-native-ultrastore/issues)
- 💬 [Ask Questions](https://github.com/yourusername/react-native-ultrastore/discussions)
- 📧 Email: your.email@example.com

---

**Happy coding! 🎉**
