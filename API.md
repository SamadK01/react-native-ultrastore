# API Reference (v3.0.0)

## Storage

### `defaultStorage` and `createStorage(options?)`

```ts
const storage = createStorage({ id?: string, encryptionKey?: string });
```

Each `StorageEngine` owns an isolated namespace and an independent store registry identity.

| Method | Description |
| --- | --- |
| `get<T>(key)` | Synchronously returns a decoded value or `undefined`. |
| `set<T>(key, value)` | Persists a value and notifies key subscribers. |
| `setMany(updates)` | Commits prepared values before emitting one batch notification. |
| `delete(key)` | Removes one value and notifies subscribers with `undefined`. |
| `clear()` | Clears this namespace and invalidates every active key listener. Mounted stores reset to their initial values. |
| `has(key)` / `getAllKeys()` | Inspect this namespace. |
| `hydrate()` | Loads the namespaced AsyncStorage fallback into memory; unnecessary with MMKV or browser localStorage. |
| `onChange(key, listener)` | Subscribe to one key. Returns an unsubscribe function. |
| `onBatchChange(listener)` | Subscribe once per committed `setMany()` batch. |
| `use(middleware)` | Register storage middleware. |
| `getUsingFallback()` | Indicates an unsupported native or SSR fallback. |

### Namespaces

```ts
const userStorage = createNamespace('user');
const cartStorage = createNamespace('cart');
```

Namespaces isolate native MMKV IDs, web keys, and AsyncStorage fallback keys. A store cache is also tied to its precise `StorageEngine` instance.

## Stores and hooks

```ts
const [value, setValue] = useUltraStore(key, initialValue, storage?);
```

`setValue` accepts a value, updater, Promise, or two-argument thunk. `Store.delete()` resets connected listeners through storage deletion, then detaches the store and purges its registry entry.

- `useUltraStoreSelector(key, selector, initialValue, storage?)`
- `useUltraStoreValue(key, initialValue, storage?)`
- `useUltraStoreSetter(key, initialValue, storage?)`
- `useDerived(keys, compute)`
- `useUltraHistory(key, initialValue, { maxHistory? })`
- `getStore(key, initialValue, storage?)`
- `clearStoreRegistry()` — detaches and removes all cached stores; intended for controlled teardown/tests.

## Batching

```ts
batchSet({ theme: 'dark', loggedIn: true }, storage?);
const update = useBatchUpdate(storage?);
```

`batchSet` delegates to `setMany`. React Native updates are wrapped by `unstable_batchedUpdates`, so hooks that observe multiple changed keys receive one render cycle after the full batch is committed.

## Atoms, migrations, and adapters

- `createAtom(key, initialValue, storage?)` / `useUltraAtom(atom)`
- `createMigrationManager(storage, { migrations, targetVersion, versionKey? })`
- `createUltraZustandStorage(storage?)`

## Middleware

- `createLoggerMiddleware(options?)`
- `createValidatorMiddleware(rules)`
- `createDevToolsMiddleware()`

## AI sub-path

`react-native-ultrastore/ai` exports `VectorStore`, `searchSimilarVectors`, `cosineSimilarity`, `euclideanDistance`, Base64 conversion helpers, `UltraStreamCache`, `defaultStreamCache`, and `trimContextWindow`. `VectorStore` validates finite non-empty `Float32Array` values, caches decoded vectors in memory, exposes `clearCache()`, and supports cosine (`searchSimilar`) and Euclidean (`searchNearest`) search.
