# UltraStore Example Usage (v2.0.0)

## Basic Usage

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUltraStore } from 'react-native-ultrastore';

function UserProfile() {
  const [user, setUser] = useUltraStore('user', { 
    name: '', 
    email: '',
    token: '' 
  });

  return (
    <View>
      <Text>Name: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      
      <Button
        title="Update User"
        onPress={() => setUser({ 
          name: 'Samad', 
          email: 'samad@example.com',
          token: 'abc123' 
        })}
      />
    </View>
  );
}
```

## Atomic State (Atoms)

Atoms are small, composable units of state inspired by Jotai.

```tsx
import { createAtom, useUltraAtom } from 'react-native-ultrastore';

// Define atoms
const themeAtom = createAtom('app_theme', 'light');
const fontSizeAtom = createAtom('font_size', 16);

function Settings() {
  const [theme, setTheme] = useUltraAtom(themeAtom);
  const [fontSize, setFontSize] = useUltraAtom(fontSizeAtom);

  return (
    <View>
      <Text>Theme: {theme}</Text>
      <Button title="Toggle Theme" onPress={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
    </View>
  );
}
```

## Batch Updates

Update multiple keys at once with zero bridge overhead and minimal re-renders.

```tsx
import { batchSet, useBatchUpdate } from 'react-native-ultrastore';

// Functional update
function bulkUpdate() {
  batchSet({
    'is_logged_in': true,
    'last_login': Date.now(),
    'session_count': 5
  });
}

// Hook usage
function BulkComponent() {
  const updateStore = useBatchUpdate();

  return (
    <Button 
      title="Batch Update" 
      onPress={() => updateStore({ key1: 'val1', key2: 'val2' })} 
    />
  );
}
```

## Zustand Adapter

Use UltraStore as a blazing fast persistence layer for Zustand.

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createUltraZustandStorage } from 'react-native-ultrastore/zustand';

const useStore = create(
  persist(
    (set) => ({
      count: 0,
      inc: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: 'zustand-storage',
      storage: createJSONStorage(() => createUltraZustandStorage()),
    }
  )
);
```

## DevTools

Inspect state changes in real-time.

```ts
import { defaultStorage, createDevToolsMiddleware } from 'react-native-ultrastore';

if (__DEV__) {
  defaultStorage.use(createDevToolsMiddleware());
}
// Now check global.__ULTRASTORE_STATE__ in your console!
```

## Fallbacks (Expo Go & Web)

UltraStore handles environments gracefully:
- **Expo Go:** Automatically uses an in-memory store so your app doesn't crash.
- **Web:** Automatically uses `localStorage`.

```tsx
// Same code works everywhere!
const [data, setData] = useUltraStore('any_key', 'initial');
```
