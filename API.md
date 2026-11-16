# API reference — v3.1

All root APIs are imported from `react-native-ultrastore`. Use the documented sub-paths for optional integrations.

## Storage

```ts
createStorage(options?: UltraStoreOptions): StorageEngine
defaultStorage: StorageEngine

interface UltraStoreOptions { id?: string; encryptionKey?: string }
type Listener<T> = (value: T) => void
```

| Member | Signature | Edge behavior |
| --- | --- | --- |
| Read | `get<T>(key: string): T \| undefined` | Returns `undefined` for absent or corrupted payloads. |
| Write | `set<T>(key: string, value: T): void` | Scalars use string/number/boolean fast paths; other values are JSON encoded. |
| Batch | `setMany(updates: Record<string, any>): void` | Completes writes before one React-batched notification; not a native multi-key transaction. |
| Delete | `delete(key: string): void` | Subscribers receive `undefined`. |
| Clear | `clear(): void` | Invalidates every active key listener in this engine. |
| Inspect | `has(key): boolean`, `getAllKeys(): string[]`, `getRawStorage(): MMKV \| null` | Raw storage is `null` on fallback. |
| Fallback | `hydrate(): Promise<void>`, `getUsingFallback(): boolean` | Hydration is needed only on the native AsyncStorage fallback. |
| Subscribe | `onChange<T>(key, listener): () => void`, `onBatchChange(listener): () => void` | Batch listeners receive `ReadonlyMap<string, any>`. |
| Middleware | `use(middleware: Middleware): void`, `setDebug(enabled: boolean): void` | Middleware exceptions abort that set. |

`Middleware<T>` supports `onBeforeSet`, `onAfterSet`, `onBeforeGet`, `onAfterGet`, and `onDelete`. `createNamespace(namespace, options?)` returns a storage engine whose ID is `ultrastore-${namespace}`. `clearAll()`, `removeKey(key)`, and `getAllKeys()` operate on `defaultStorage`.

## Persisted stores and hooks

```ts
type SetStateAction<T> = T | Promise<T> | ((previous: T) => T | Promise<T>) | Thunk<T>
type Thunk<T> = (set, get) => void | Promise<void>

useUltraStore<T>(key, initialValue, storage?): [T, (action: SetStateAction<T>) => void | Promise<void>]
useUltraStoreValue<T>(key, initialValue, storage?): T
useUltraStoreSetter<T>(key, initialValue, storage?): (action: SetStateAction<T>) => void
useUltraStoreSelector<T, R>(key, selector: (state: T) => R, initialValue, storage?): R
useDerived<T extends any[], R>(keys: string[], compute: (...values: T) => R): R
useUltraHistory<T>(key, initialValue, options?: { maxHistory?: number }): HistoryResult<T>
getStore<T>(key, initialValue, storage?): Store<T>
clearStoreRegistry(): void
```

Store identity is scoped to the exact `StorageEngine` instance and key. `Store` exposes `getValue()`, `setValue(action)`, `subscribe(listener)`, `reset(initialValue)`, `delete()`, and `dispose()`. A selector uses reference equality; return stable values when avoiding renders matters. `useDerived` observes `defaultStorage` only.

`HistoryResult<T>` contains `value`, `setValue`, `undo`, `redo`, `past`, `future`, `canUndo`, and `canRedo`. History is in memory and is not persisted separately.

## Batching, atoms, migration, and middleware

```ts
batchSet(updates: Record<string, any>, storage?: StorageEngine): void
useBatchUpdate(storage?: StorageEngine): (updates: Record<string, any>) => void

createAtom<T>(key, initialValue, storage?): Atom<T>
useUltraAtom<T>(atom: Atom<T>): [T, setter]
interface Atom<T> { key: string; initialValue: T; storage?: StorageEngine }

createMigrationManager(storage, config: MigrationConfig): Promise<void>
interface MigrationConfig { migrations: Record<number, MigrationFunc>; targetVersion: number; versionKey?: string }
type MigrationFunc = (storage: StorageEngine) => void | Promise<void>

createLoggerMiddleware(options?: { collapsed?: boolean; colors?: boolean }): Middleware
createValidatorMiddleware<T>(rules: Record<string, (value: T) => boolean | string>): Middleware<T>
createDevToolsMiddleware(): Middleware
```

Migration versions must be non-negative integers. Missing/malformed persisted versions start at `0`; a failed handler leaves the stored version unchanged. Sparse migration maps are supported. Validator failure stops the write.

## Zustand and query sub-paths

```ts
// react-native-ultrastore/zustand
createUltraZustandStorage(storage?: StorageEngine): {
  getItem(name: string): string | null;
  setItem(name: string, value: string): void;
  removeItem(name: string): void;
}

// react-native-ultrastore/query
useUltraQuery<T>(queryKey: string, fetcher: () => Promise<T>, options?: UltraQueryOptions<T>): UltraQueryResult<T>
```

`UltraQueryOptions<T>`: `staleTime?`, `cacheTime?`, `refetchOnMount?`, `onSuccess?`, `onError?`, `storage?`, and `enabled?`. Durations must be finite non-negative values; invalid durations use defaults. `UltraQueryResult<T>` contains `data`, `error`, `status`, `isLoading`, `isError`, `isSuccess`, `isFetching`, `isStale`, `refetch`, and `invalidate`.

The query hook persists `{ data, fetchedAt }`. Invalid cache shapes are treated as misses; only the latest active request may update a mounted hook.

## AI sub-path

```ts
// react-native-ultrastore/ai
float32ArrayToBase64(vector: Float32Array): string
base64ToFloat32Array(value: string): Float32Array
cosineSimilarity(a: Float32Array, b: Float32Array): number
euclideanDistance(a: Float32Array, b: Float32Array): number
searchSimilarVectors(query, topK?, storage?, namespace?): VectorSearchResult[]

new VectorStore(storage?: StorageEngine, namespace?: string)
setVector(key: string, vector: Float32Array): void
getVector(key: string): Float32Array | null
deleteVector(key: string): void
clearCache(): void
searchSimilar(queryVector: Float32Array, topK?: number): VectorSearchResult[]
searchNearest(queryVector: Float32Array, topK?: number): VectorDistanceResult[]

new UltraStreamCache(storage?: StorageEngine)
appendStreamToken(streamId: string, token: string): void
getStream(streamId: string): string
getStreamTokens(streamId: string): string[]
flushStream(streamId: string): string
clearStream(streamId: string): void

trimContextWindow(messages: ChatMessage[], maxCount: number, options?: { preserveSystemPrompt?: boolean }): ChatMessage[]
```

`VectorSearchResult` is `{ key, score, vector }`; `VectorDistanceResult` is `{ key, distance, vector }`. Vectors must be finite, non-empty `Float32Array` values. Mismatched dimensions are skipped; invalid queries and `topK <= 0` return `[]`; `topK` above the collection size is capped naturally. Zero-magnitude cosine vectors score `0`. Vectors are Base64-persisted and ownership-copied at the public boundary; search walks cached typed arrays directly.

`UltraStreamCache` is in-memory until `flushStream`. It does not publish React state, joins once per append burst, and releases its token array when flushed or cleared. `trimContextWindow` can keep an initial system message while retaining the newest messages.
