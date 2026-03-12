# Migration Guide

## From UltraStore v1 to v2 (New Architecture)

UltraStore v2.0.0 is a major upgrade. Please follow these steps to migrate.

### 1. Update Dependencies
```bash
npm install react-native-mmkv@>=4.0.0 react-native-nitro-modules@>=0.35.0
```
UltraStore v2 requires **React Native 0.75+** because MMKV v4 is a Nitro Module.

### 2. Native Code Changes
If you were using `StorageEngine.delete(key)`, no code changes are needed! It now calls MMKV's new `.remove(key)` internally, maintaining backward compatibility.

### 3. New Architecture
If you are moving to the New Architecture (Fabric), UltraStore v2 is **bridge-free** and requires zero manual configuration.

---

## From AsyncStorage
... (rest of the content)

### Before (AsyncStorage)

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load on mount
    AsyncStorage.getItem('user').then(data => {
      if (data) setUser(JSON.parse(data));
    });
  }, []);

  const updateUser = async (newUser) => {
    setUser(newUser);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  };

  return <View>...</View>;
}
```

### After (UltraStore)

```tsx
import { useUltraStore } from 'react-native-ultrastore';

function App() {
  const [user, setUser] = useUltraStore('user', null);

  // That's it! Auto-persists and auto-loads

  return <View>...</View>;
}
```

**Benefits:**
- ⚡ 10-30x faster
- 🎯 No boilerplate
- 🔄 Auto persistence
- 🎨 Better TypeScript support

---

## From Redux + Redux Persist

### Before (Redux)

```tsx
// store.js
import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = (state = { user: null }, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistedReducer);
export const persistor = persistStore(store);

// App.js
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MainApp />
      </PersistGate>
    </Provider>
  );
}

// Component.js
import { useSelector, useDispatch } from 'react-redux';

function Component() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const updateUser = (newUser) => {
    dispatch({ type: 'SET_USER', payload: newUser });
  };

  return <View>...</View>;
}
```

### After (UltraStore)

```tsx
// App.js - No setup needed!
function App() {
  return <MainApp />;
}

// Component.js
import { useUltraStore } from 'react-native-ultrastore';

function Component() {
  const [user, setUser] = useUltraStore('user', null);

  return <View>...</View>;
}
```

**Benefits:**
- 📦 90% less code
- ⚡ Much faster
- 🎯 No boilerplate
- 🔄 Auto persistence
- 🎨 Simpler API

---

## From Zustand

### Before (Zustand)

```tsx
import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage',
      getStorage: () => AsyncStorage,
    }
  )
);

function Component() {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  return <View>...</View>;
}
```

### After (UltraStore)

```tsx
import { useUltraStore } from 'react-native-ultrastore';

function Component() {
  const [user, setUser] = useUltraStore('user', null);

  return <View>...</View>;
}
```

**Benefits:**
- ⚡ 10-30x faster (MMKV vs AsyncStorage)
- 🎯 Simpler API
- 🔄 Built-in persistence

---

## From Context API

### Before (Context)

```tsx
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

function UserProvider({ children }) {
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

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}

function Component() {
  const { user, updateUser } = useContext(UserContext);
  return <View>...</View>;
}
```

### After (UltraStore)

```tsx
import { useUltraStore } from 'react-native-ultrastore';

// No provider needed!

function Component() {
  const [user, setUser] = useUltraStore('user', null);
  return <View>...</View>;
}
```

**Benefits:**
- 🎯 No provider setup
- ⚡ Much faster
- 🔄 Auto persistence
- 📦 Less boilerplate

---

## Migration Checklist

### Step 1: Install UltraStore

```bash
yarn add react-native-ultrastore react-native-mmkv
cd ios && pod install
```

### Step 2: Replace Storage Calls

Replace all AsyncStorage calls with UltraStore hooks:

```tsx
// Before
const [data, setData] = useState(null);
useEffect(() => {
  AsyncStorage.getItem('key').then(/* ... */);
}, []);

// After
const [data, setData] = useUltraStore('key', null);
```

### Step 3: Remove Old Dependencies

```bash
yarn remove @react-native-async-storage/async-storage
yarn remove redux redux-persist react-redux
yarn remove zustand
```

### Step 4: Clean Up

- Remove store configuration files
- Remove provider components
- Remove action creators and reducers
- Simplify component code

### Step 5: Test

- Test data persistence across app restarts
- Verify all features work correctly
- Check performance improvements

---

## Data Migration

If you need to migrate existing data:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultStorage } from 'react-native-ultrastore';

async function migrateData() {
  try {
    // Get all AsyncStorage keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Migrate each key
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        defaultStorage.set(key, JSON.parse(value));
      }
    }
    
    // Optional: Clear AsyncStorage after migration
    // await AsyncStorage.clear();
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run once on app start
migrateData();
```

---

## Need Help?

- 📖 [Documentation](./README.md)
- 💬 [Discussions](https://github.com/yourusername/react-native-ultrastore/discussions)
- 🐛 [Report Issues](https://github.com/yourusername/react-native-ultrastore/issues)
