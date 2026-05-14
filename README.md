# 🚀 UltraStore v2.2.0

[![New Architecture](https://img.shields.io/badge/New_Architecture-Ready-brightgreen)](https://reactnative.dev/docs/the-new-architecture-introduction)
[![Nitro Module](https://img.shields.io/badge/Powered_by-Nitro_Modules-blue)](https://nitro.margelo.com/)
[![MMKV v4](https://img.shields.io/badge/MMKV-v4-orange)](https://github.com/mrousavy/react-native-mmkv)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/react-native-ultrastore)](https://www.npmjs.com/package/react-native-ultrastore)

The fastest, most modern storage + state management library for React Native. Built on **MMKV v4** for near-zero bridge overhead — with the **only persistent async query cache** in the React Native ecosystem.

> [!IMPORTANT]
> **React Native 0.75+ required.** This library uses MMKV v4 which requires the New Architecture.

## ✨ Features

- ⚡ **Blazing Fast:** 10–30x faster than AsyncStorage, powered by MMKV v4 + JSI.
- 🌐 **Persistent Query Cache:** `useUltraQuery` — fetch + cache API data in MMKV. Survives app restarts. Unlike React Query / SWR.
- 🏗️ **New Architecture First:** Full support for Fabric and TurboModules with zero bridge overhead.
- 🛠 **Migrations Manager:** Build version-based structural upgrades (`createMigrationManager`).
- 🔔 **Global Subscriptions:** Native Pub/Sub via `storage.onChange(key, callback)`.
- ⚛️ **Atom API:** Jotai-style atomic state for composable, isolated state units.
- 📦 **Zustand Adapter:** Use UltraStore as a persistence layer for Zustand in one line.
- 🧪 **Expo Go Fallback:** Seamless async fallback via `AsyncStorage` + Memory using `await storage.hydrate()`.
- 🔄 **Batch Updates:** Write multiple keys in a single operation with zero redundant renders.
- 🔐 **Encryption:** Secure your data with MMKV's native encryption.
- 🕐 **Undo / Redo History:** Built-in history management for any store key.

---

## 🚀 Quick Start

```bash
npm install react-native-ultrastore react-native-mmkv
```

---

## 📖 API Reference

### 1. Basic Hook

```tsx
import { useUltraStore } from 'react-native-ultrastore';

const [user, setUser] = useUltraStore('user_profile', { name: 'Samad' });
```

---

### 2. `useUltraQuery` — Persistent Async Cache ⭐ New in v2.2

The only React Native hook that **persists API cache to disk via MMKV**. Your data survives app restarts, works offline, and stays fresh automatically.

```tsx
import { useUltraQuery } from 'react-native-ultrastore';

function UserProfile() {
  const { data, isLoading, error, refetch, isStale } = useUltraQuery(
    'user_profile',                                          // cache key (stored in MMKV)
    () => fetch('https://api.example.com/me').then(r => r.json()), // async fetcher
    {
      staleTime: 60_000,   // data is fresh for 60 seconds
      cacheTime: 300_000,  // cache deleted after 5 minutes of inactivity
      onSuccess: (data) => console.log('Fetched!', data),
      onError: (err) => console.error('Failed:', err),
    }
  );

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return <Text>{data?.name}</Text>;
}
```

**Options:**

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `staleTime` | `number` | `300_000` (5 min) | Ms before cache is considered stale |
| `cacheTime` | `number` | `600_000` (10 min) | Ms before cache is deleted from MMKV |
| `refetchOnMount` | `boolean` | `false` | Force refetch even if cache is fresh |
| `enabled` | `boolean` | `true` | Disable query from running |
| `onSuccess` | `(data: T) => void` | — | Called on successful fetch |
| `onError` | `(error: Error) => void` | — | Called on fetch failure |
| `storage` | `StorageEngine` | `defaultStorage` | Custom storage instance |

**Result:**

| Field | Type | Description |
|:---|:---|:---|
| `data` | `T \| undefined` | Cached or fetched data |
| `isLoading` | `boolean` | True on first fetch with no cache |
| `isFetching` | `boolean` | True whenever a fetch is in progress |
| `isSuccess` | `boolean` | True when data is available |
| `isError` | `boolean` | True when last fetch failed |
| `isStale` | `boolean` | True when cache has expired |
| `error` | `Error \| undefined` | Last error |
| `refetch` | `() => Promise<void>` | Manually trigger a refetch |
| `invalidate` | `() => void` | Delete cache and mark as stale |

**Why `useUltraQuery` beats React Query / SWR on mobile:**

| | React Query | SWR | **useUltraQuery** |
|:---|:---|:---|:---|
| Cache storage | Memory only | Memory only | **MMKV (disk)** |
| Survives app restart | ❌ | ❌ | ✅ |
| Works offline | ❌ | ❌ | ✅ (stale cache) |
| Bundle size | ~13KB | ~4KB | **~1KB** |
| React Native optimized | ⚠️ | ⚠️ | ✅ |

---

### 3. Atomic State

```tsx
import { createAtom, useUltraAtom } from 'react-native-ultrastore';

const themeAtom = createAtom('app_theme', 'dark');

function Component() {
  const [theme, setTheme] = useUltraAtom(themeAtom);
}
```

---

### 4. Zustand Integration

```ts
import { createUltraZustandStorage } from 'react-native-ultrastore';

const useStore = create(
  persist(
    (set) => ({ count: 0, increment: () => set((s) => ({ count: s.count + 1 })) }),
    {
      name: 'my-storage',
      storage: createJSONStorage(() => createUltraZustandStorage()),
    }
  )
);
```

---

### 5. Async Actions / Thunks

```tsx
const [user, setUser] = useUltraStore('user', null);

setUser(async (set, get) => {
  const data = await fetchUser();
  set(data);
});
```

---

### 6. Undo / Redo History

```tsx
import { useUltraHistory } from 'react-native-ultrastore';

const { value, setValue, undo, redo, canUndo, canRedo } = useUltraHistory(
  'text_input',
  '',
  { maxHistory: 30 }
);
```

---

### 7. Batch Updates

```ts
import { batchSet } from 'react-native-ultrastore';

batchSet({
  is_logged_in: true,
  last_login: Date.now(),
  session_count: 5,
});
```

---

### 8. Migrations

```ts
import { createMigrationManager } from 'react-native-ultrastore';

await createMigrationManager(defaultStorage, {
  targetVersion: 2,
  migrations: {
    1: (storage) => { /* rename keys, reshape data */ },
    2: (storage) => { /* add new fields */ },
  },
});
```

---

### 9. DevTools Middleware

```ts
import { defaultStorage, createDevToolsMiddleware } from 'react-native-ultrastore';

if (__DEV__) {
  defaultStorage.use(createDevToolsMiddleware());
}
```

State changes are synced to Redux DevTools and accessible via `global.__ULTRASTORE_STATE__`.

---

### 10. Encryption

```ts
import { createStorage } from 'react-native-ultrastore';

const secureStorage = createStorage({ encryptionKey: 'my-secret-key' });
const [token, setToken] = useUltraStore('auth_token', '', secureStorage);
```

---

## 🌍 Web & SSR Support

UltraStore automatically uses `localStorage` on web and is fully SSR-safe.

```tsx
// Works out of the box in Next.js / Expo Web
const [state, setState] = useUltraStore('key', 'default');
```

---

## 🗺️ Comparison

| Feature | UltraStore | AsyncStorage | Zustand | Jotai | React Query |
|:---|:---|:---|:---|:---|:---|
| **Persistence** | ✅ Built-in | ✅ | ⚠️ Manual | ⚠️ Manual | ❌ |
| **Async Query Cache** | ✅ Persistent | ❌ | ❌ | ❌ | ✅ Memory only |
| **Speed** | 🚀 MMKV JSI | 🐢 Bridge | ✅ | ✅ | ✅ |
| **Atoms** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Encryption** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Offline Cache** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Web / Expo Go** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Undo / Redo** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Migrations** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🛤️ Migration Guide (v1 → v2)

1. **Peer Dependencies:** Ensure `react-native-mmkv@>=4.0.0`.
2. **`StorageEngine.delete()`** now calls `remove()` internally to match MMKV v4. API is backward compatible.
3. **New Architecture:** No code changes required.

---

## 📦 Peer Dependencies

```json
{
  "react": ">=18.0.0",
  "react-native": ">=0.75.0",
  "react-native-mmkv": ">=4.0.0"
}
```

---

## License

MIT © [Samad Khalid](https://github.com/SamadK01)
