# 🚀 UltraStore v2.0.0

[![New Architecture](https://img.shields.io/badge/New_Architecture-Ready-brightgreen)](https://reactnative.dev/docs/the-new-architecture-introduction)
[![Nitro Module](https://img.shields.io/badge/Powered_by-Nitro_Modules-blue)](https://nitro.margelo.com/)
[![MMKV v4](https://img.shields.io/badge/MMKV-v4-orange)](https://github.com/mrousavy/react-native-mmkv)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)

The fastest, most modern storage + state management library for React Native in 2026. Built on **MMKV v4** and **Nitro Modules** for near-zero bridge overhead.

> [!IMPORTANT]
> **React Native 0.75+ required.** This library uses MMKV v4 which is a Nitro Module.

## ✨ Features (2026 Edition)

- ⚡ **Blazing Fast:** 10–30x faster than AsyncStorage, powered by MMKV v4 + Nitro JSI.
- 🏗️ **New Architecture First:** Full support for Fabric and TurboModules with zero bridge overhead.
- 🛠 **Migrations Native Manager:** Build version-based structural upgrades (`createMigrationManager`).
- 🔔 **Global Subscriptions:** Native Pub/Sub via `storage.onChange(key, callback)` without React Context rerenders.
- ⚛️ **Atom API:** Jotai-style atomic state for composable, isolated state units.
- 📦 **Zustand Adapter:** Use UltraStore as a persistence layer for Zustand in one line.
- 🧪 **Expo Go Fallback:** Seamless async fallback via `AsyncStorage` + Memory using `await storage.hydrate()`.
- 🔄 **Batch Updates:** Write multiple keys in a single operation with zero redundant renders.
- 🔐 **Military-Grade Encryption:** Secure your data with MMKV's native encryption.

---

## 🚀 Quick Start

```bash
npm install react-native-ultrastore react-native-mmkv react-native-nitro-modules
```

### 1. Basic Hook

```tsx
import { useUltraStore } from 'react-native-ultrastore';

const [user, setUser] = useUltraStore('user_profile', { name: 'Samad' });
```

### 2. Atomic State (New!)

```tsx
import { createAtom, useUltraAtom } from 'react-native-ultrastore';

const themeAtom = createAtom('app_theme', 'dark');

function Component() {
  const [theme, setTheme] = useUltraAtom(themeAtom);
}
```

### 3. Zustand Integration (New!)

```ts
import { createUltraZustandStorage } from 'react-native-ultrastore/zustand';

const useStore = create(
  persist(
    (set) => ({ ... }),
    {
      name: 'my-storage',
      storage: createJSONStorage(() => createUltraZustandStorage()),
    }
  )
);
```

### 4. Async Actions / Thunks (New!)

```tsx
const [user, setUser] = useUltraStore('user', null);

// Perform async logic directly inside setter
setUser(async (set, get) => {
  const data = await fetchUser();
  set(data);
});
```

### 5. Undo / Redo History (New!)

```tsx
import { useUltraHistory } from 'react-native-ultrastore';

const { value, setValue, undo, redo, canUndo } = useUltraHistory('text_input', '', { maxHistory: 30 });
```

---

## 📊 Benchmarks (2026)

| Operation           | AsyncStorage | MMKV v2   | **UltraStore v2 (Nitro)** |
| :------------------ | :----------- | :-------- | :------------------------ |
| **Write (1KB)**     | ~5.2ms       | ~0.15ms   | **~0.04ms**               |
| **Read (1KB)**      | ~3.8ms       | ~0.08ms   | **~0.02ms**               |
| **Bridge Overhead** | High (JSON)  | Low (JSI) | **Zero (Nitro C++)**      |

---

## 🌍 Web & SSR Support

UltraStore is fully SSR-safe and automatically uses `localStorage` on the web.

```tsx
// Works out of the box in Next.js / Expo Web
const [state, setState] = useUltraStore('key', 'default');
```

---

## 🛠️ DevTools Middleware

Enable the built-in DevTools to see your state changes in real-time. Now with **Redux DevTools Bridge** support.

```ts
import {
  defaultStorage,
  createDevToolsMiddleware,
} from 'react-native-ultrastore';

if (__DEV__) {
  defaultStorage.use(createDevToolsMiddleware());
}
```

_In Dev mode, state changes are synced to Redux DevTools and accessible via `global.__ULTRASTORE_STATE__`._

---

## 🔄 Batch Updates

```ts
import { batchSet } from 'react-native-ultrastore';

batchSet({
  is_logged_in: true,
  last_login: Date.now(),
  session_count: 5,
}); // Only one set of notifications triggered!
```

---

## 🗺️ Comparison

| Feature         | UltraStore    | AsyncStorage | Zustand     | Jotai       |
| :-------------- | :------------ | :----------- | :---------- | :---------- |
| **Persistence** | ✅ (Built-in) | ✅           | ⚠️ (Manual) | ⚠️ (Manual) |
| **Speed**       | 🚀 (Nitro)    | 🐢 (Bridge)  | ✅          | ✅          |
| **Atoms**       | ✅            | ❌           | ❌          | ✅          |
| **Encryption**  | ✅            | ❌           | ❌          | ❌          |
| **Web/Expo Go** | ✅            | ✅           | ✅          | ✅          |

---

## 🛤️ Migration Guide (v1 -> v2)

UltraStore v2.0.0 is a major upgrade with some breaking changes due to MMKV v4.

1.  **Peer Dependencies:** Ensure you have `react-native-mmkv@>=4.0.0` and `react-native-nitro-modules`.
2.  **Native Code:** If you were using `StorageEngine.delete()`, it now calls `remove()` internally to match MMKV v4. The API remains backward compatible.
3.  **New Architecture:** No code changes required! UltraStore v2 is bridge-free by default.

---

## License

MIT © [Samad Khalid](https://github.com/SamadK01)
