# 📝 UltraStore v2.0.0 Cheat Sheet

Quick reference for the fastest React Native storage engine.

## Installation

```bash
npm install react-native-ultrastore react-native-mmkv react-native-nitro-modules
cd ios && pod install
```

## ⚛️ Atoms (Atomic State)
```tsx
const themeAtom = createAtom('theme', 'dark');
const [theme, setTheme] = useUltraAtom(themeAtom);
```

## 🏗️ Storage Hooks
```tsx
// Core hook
const [val, setVal] = useUltraStore('key', 'init');

// Atomic hook
const [theme, setTheme] = useUltraAtom(themeAtom);

// Batch updates
const update = useBatchUpdate();
update({ key1: 'val1', key2: 'val2' });
```

## 🔄 Third-Party Adapters
```ts
// Zustand
storage: createJSONStorage(() => createUltraZustandStorage())
```

## 🛠️ Middleware & DevTools
```ts
// DevTools (Inspection)
defaultStorage.use(createDevToolsMiddleware());

// Check state in console:
global.__ULTRASTORE_STATE__
```

## 🌏 Environments
- **Nitro JSI:** Native speed on New Arch.
- **Expo Go:** Safe in-memory fallback.
- **Web:** `localStorage` fallback.

## 🧹 Utilities
```ts
clearAll();        // Reset storage
removeKey('key');  // Delete key
getAllKeys();      // List all
```
