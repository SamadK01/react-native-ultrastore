# Migration guide

## Upgrade to v3.1

No API migration is required from v3.0. Query cache validation is stricter: persisted entries without a finite `fetchedAt` are cache misses and refetch normally. `UltraStreamCache.getStreamTokens()` returns a copy, so mutating its return value no longer mutates an active stream.

## From AsyncStorage

Install the native dependencies and use a development build or release build:

```bash
npm install react-native-ultrastore react-native-mmkv react-native-nitro-modules
```

```ts
import { useUltraStore } from 'react-native-ultrastore';

const [profile, setProfile] = useUltraStore('profile', { name: '' });
```

The normal MMKV path is synchronous. Expo Go and unsupported native binaries use the AsyncStorage fallback; call `await storage.hydrate()` before relying on restored fallback state.

## Schema migration

Run migrations before mounting state consumers:

```ts
import { createMigrationManager, createStorage } from 'react-native-ultrastore';

const storage = createStorage({ id: 'account' });
await createMigrationManager(storage, {
  targetVersion: 2,
  migrations: {
    1: (db) => db.set('profile', { name: '' }),
    2: (db) => db.set('profileSchema', 2),
  },
});
```

Versions are non-negative integers. A missing or malformed persisted version starts at `0`. A handler failure stops processing and leaves the stored version unchanged; fix the handler and retry on the next launch. Sparse migration maps are permitted when an intervening version requires no data change.

## From Zustand persistence

Keep Zustand for state modeling and swap its persistence adapter:

```ts
import { createJSONStorage, persist } from 'zustand/middleware';
import { createUltraZustandStorage } from 'react-native-ultrastore/zustand';

persist(createState, {
  name: 'app-state',
  storage: createJSONStorage(() => createUltraZustandStorage()),
});
```

## From a database-backed vector store

`VectorStore` is a small/medium local cache with linear similarity search. It persists vectors as Base64 through the string storage interface and scores cached `Float32Array` values directly. Keep a database or native ANN index for large corpora, relational metadata, or transactional requirements.
