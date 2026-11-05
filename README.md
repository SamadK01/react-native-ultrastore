# UltraStore v3.0.0

[![npm](https://img.shields.io/npm/v/react-native-ultrastore)](https://www.npmjs.com/package/react-native-ultrastore)
[![React Native](https://img.shields.io/badge/React_Native-0.75%2B-61dafb)](https://reactnative.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-New_Architecture-blue)](https://reactnative.dev/docs/the-new-architecture-introduction)

Synchronous persisted state for React Native, powered by MMKV v4 and Nitro Modules. UltraStore combines a namespaced storage engine, React hooks, coordinated batch updates, and local AI-oriented utilities.

> React Native 0.75+, React 18+, `react-native-mmkv` 4+, and `react-native-nitro-modules` are required for native synchronous storage. Web uses namespaced `localStorage`; unsupported native environments fall back to AsyncStorage after an explicit `hydrate()` call.

## v3.0 highlights

- Namespaced storage isolation on native, web, SSR, and the AsyncStorage fallback.
- Per-`StorageEngine` store registries: identical keys in separate engines never share state or listeners.
- Coordinated `setMany()` / `batchSet()` writes with a single batch notification and React Native `unstable_batchedUpdates`.
- Instant `clear()` invalidation: mounted stores reset to their declared initial values in one React update cycle.
- Store deletion disconnects subscriptions and removes the exact instance from the global registry.
- Optional AI utilities for Base64-persisted `Float32Array` vectors, cosine search, stream accumulation, and context trimming.

## Install

```bash
npm install react-native-ultrastore react-native-mmkv react-native-nitro-modules
```

For Expo development builds, configure the included plugin and build a native app. Expo Go uses the asynchronous fallback; call `await storage.hydrate()` before relying on persisted fallback values.

## Core state

```tsx
import { useUltraStore } from 'react-native-ultrastore';

function Profile() {
  const [profile, setProfile] = useUltraStore('profile', {
    name: 'Samad',
    role: 'Developer',
  });

  return <Button title={profile.name} onPress={() => setProfile((value) => ({ ...value, name: 'Ada' }))} />;
}
```

`useUltraStore` reads synchronously and persists every successful update. `useUltraStoreSelector`, `useUltraStoreValue`, and `useUltraStoreSetter` provide narrower subscriptions where appropriate.

## Namespaces and lifecycle

```ts
import { createNamespace, getStore } from 'react-native-ultrastore';

const accountStorage = createNamespace('account');
const catalogStorage = createNamespace('catalog');

accountStorage.set('id', 'user-1');
catalogStorage.set('id', 'product-1'); // isolated from accountStorage

const account = getStore('id', '', accountStorage);
account.delete(); // resets mounted subscribers, detaches listeners, and removes this registry entry

catalogStorage.clear(); // invalidates only catalogStorage's mounted stores
```

Storage IDs isolate persistent backends. Store identity is additionally bound to the exact `StorageEngine` instance, preventing listener collisions even when two engines use the same configured ID.

## Coordinated batch updates

```ts
import { batchSet, defaultStorage } from 'react-native-ultrastore';

batchSet(
  {
    session: { userId: 'u1', token: 'token' },
    theme: 'dark',
    onboardingComplete: true,
  },
  defaultStorage
);
```

`batchSet()` delegates to `StorageEngine.setMany()`. All values are prepared before subscribers are notified; mounted hooks observing several updated keys are grouped with `unstable_batchedUpdates` into one React update cycle. AsyncStorage fallback persistence uses `multiSet()`. MMKV v4 exposes synchronous per-key writes rather than a native multi-set API, so UltraStore supplies the atomic JavaScript visibility and notification boundary after all MMKV writes complete.

## Zustand persistence

```ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createUltraZustandStorage } from 'react-native-ultrastore/zustand';

const useStore = create(
  persist(
    (set) => ({ count: 0, increment: () => set((state) => ({ count: state.count + 1 })) }),
    { name: 'app-storage', storage: createJSONStorage(() => createUltraZustandStorage()) }
  )
);
```

## Persistent query cache

```tsx
import { useUltraQuery } from 'react-native-ultrastore/query';

const result = useUltraQuery(
  'user-profile',
  () => fetch('https://api.example.com/me').then((response) => response.json()),
  { staleTime: 60_000, cacheTime: 300_000 }
);
```

The cached response is persisted through the selected storage engine. Fresh cache entries are returned on mount; stale entries are retained until a successful refetch or eviction.

## AI utilities

```ts
import { UltraStreamCache, VectorStore } from 'react-native-ultrastore/ai';

const vectors = new VectorStore();
vectors.setVector('chunk-1', new Float32Array([0.12, -0.45, 0.89]));
const matches = vectors.searchSimilar(new Float32Array([0.1, -0.42, 0.85]), 5);

const stream = new UltraStreamCache();
stream.appendStreamToken('reply-1', 'Hello');
stream.appendStreamToken('reply-1', ' world');
stream.flushStream('reply-1');
```

Vectors are validated as finite, non-empty `Float32Array` values, encoded as Base64 for portable storage, then decoded into a per-store memory cache. Use `searchSimilar()` for cosine ranking, `searchNearest()` for Euclidean ranking, and `clearCache()` to release decoded vectors. The stream cache is in-memory until `flushStream()` persists it.

## Export paths

- `react-native-ultrastore` — storage, stores, hooks, middleware, batching, migrations, and utilities
- `react-native-ultrastore/ai` — vector, stream, and context helpers
- `react-native-ultrastore/zustand` — Zustand storage adapter
- `react-native-ultrastore/query` — persistent query hook
- `react-native-ultrastore/atom` — atomic-state helpers

See [API.md](./API.md) for the complete surface area and [MIGRATION.md](./MIGRATION.md) for migration guidance.

## License

MIT © [Samad Khalid](https://github.com/SamadK01)
