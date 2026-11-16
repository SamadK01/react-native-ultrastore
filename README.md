# react-native-ultrastore v3.1

Synchronous persisted state for React Native, built on MMKV v4 and Nitro Modules. UltraStore combines scalar fast paths, React subscriptions, coordinated updates, schema migration, and local AI utilities without adding runtime dependencies of its own.

## 30-second quickstart

One package can cover synchronous persisted state, a Zustand persistence adapter, a small persistent query hook, and local vector/stream buffers on a React Native New Architecture build. It does not replace a relational database, a server cache, or a large-scale ANN vector index.

```ts
import { createStorage, useUltraStore } from 'react-native-ultrastore';

const storage = createStorage({ id: 'app' });

function Session() {
  const [session, setSession] = useUltraStore('session', null, storage);
  return { session, signIn: (token: string) => setSession({ token }) };
}
```

Native synchronous operation requires React Native 0.75+, React 18+, `react-native-mmkv` 4+, and `react-native-nitro-modules`. Web uses namespaced `localStorage`; unsupported native environments use the AsyncStorage fallback and must call `await storage.hydrate()` before depending on restored values.

## Why UltraStore

- `string`, `number`, and `boolean` values use scalar prefixes (`s:`, `n:`, `b:`), avoiding JSON encode/decode.
- MMKV reads and writes are synchronous on native through JSI/Nitro. There is no Promise wrapper on the normal native path.
- `setMany()` prepares all values, commits every write, then emits a single React-batched visibility boundary.
- Vector scoring walks `Float32Array` elements directly. Persistence uses Base64 because the storage interface is string-based; it never JSON-serializes embeddings.
- Stream accumulation is in-memory and does not subscribe React components. A text snapshot is joined once per append burst, not once per reader.

## Install

```bash
npm install react-native-ultrastore react-native-mmkv react-native-nitro-modules
```

For Expo, use a development build with the included config plugin. Expo Go runs the asynchronous fallback.

## Performance boundaries

| Operation | Native MMKV path | AsyncStorage fallback |
| --- | --- | --- |
| Scalar read/write | synchronous scalar fast path | asynchronous durable write; hydrate before restored reads |
| Object read/write | synchronous; JSON payload | asynchronous durable write |
| Vector search | direct `Float32Array` scoring in JS | same in-memory scoring after vector decode |

The repository benchmark only asserts sub-0.1 ms scalar operations in its controlled test environment. Do not publish a universal `0.003 ms` or `1,200 ms` comparison: device, payload size, engine, and benchmark methodology materially change those numbers. Measure your release build on target hardware.

## Recipes

### Full-stack mobile AI app

```ts
import { createStorage, useUltraStore } from 'react-native-ultrastore';
import { useUltraQuery } from 'react-native-ultrastore/query';
import { UltraStreamCache, VectorStore } from 'react-native-ultrastore/ai';

const storage = createStorage({ id: 'mobile-ai' });
const vectors = new VectorStore(storage, 'docs');
const stream = new UltraStreamCache(storage);

export function useAssistant() {
  const [session, setSession] = useUltraStore<{ token: string } | null>('session', null, storage);
  const profile = useUltraQuery('profile', () =>
    fetch('https://example.com/me', { headers: { Authorization: `Bearer ${session?.token ?? ''}` } })
      .then((response) => response.json()),
    { storage, enabled: session !== null }
  );
  const ask = (token: string) => stream.appendStreamToken('reply', token);
  const finish = () => stream.flushStream('reply');
  const retrieve = (embedding: Float32Array) => vectors.searchSimilar(embedding, 4);
  return { session, setSession, profile, ask, finish, retrieve };
}
```

The hook owns UI update cadence. `UltraStreamCache` deliberately does not trigger React renders for every model token.

### Offline-first session with schema migration

```ts
import { createMigrationManager, createStorage } from 'react-native-ultrastore';

const storage = createStorage({ id: 'account' });

await createMigrationManager(storage, {
  targetVersion: 2,
  migrations: {
    1: (db) => db.set('session', { token: '', userId: null }),
    2: (db) => db.set('sessionSchema', 2),
  },
});

storage.set('session', { token: 'token', userId: 'u_123' });
```

Run migrations before mounting consumers. A failed migration leaves the version unchanged so the next launch does not claim a partial upgrade succeeded.

### High-frequency UI updates

```ts
import { batchSet } from 'react-native-ultrastore';

batchSet({
  connection: 'online',
  lastEventAt: Date.now(),
  unreadCount: 12,
});
```

Subscribers observe the completed batch through one React Native batched notification. This is an atomic visibility boundary in JavaScript, not a native MMKV multi-key transaction.

### Local semantic search

```ts
import { VectorStore } from 'react-native-ultrastore/ai';

const vectors = new VectorStore(undefined, 'knowledge-base');
vectors.setVector('chunk:welcome', new Float32Array([0.12, -0.45, 0.89]));

const matches = vectors.searchSimilar(
  new Float32Array([0.1, -0.42, 0.85]),
  5
);
```

`VectorStore` takes an ownership copy on write and returns copies on read/results so consumer mutation cannot corrupt its search index. The inner scoring loop reads raw typed-array memory. Persistent vectors are Base64, not JSON; call `clearCache()` when the decoded in-memory index is no longer needed.

### Persistent query cache

```tsx
import { useUltraQuery } from 'react-native-ultrastore/query';

const profile = useUltraQuery(
  'profile',
  () => fetch('https://api.example.com/me').then((response) => response.json()),
  { staleTime: 60_000, cacheTime: 300_000 }
);
```

## Export paths

- `react-native-ultrastore` — storage, stores, hooks, middleware, batching, migrations, and utilities
- `react-native-ultrastore/ai` — vectors, streaming cache, and context window helpers
- `react-native-ultrastore/zustand` — Zustand persistence adapter
- `react-native-ultrastore/query` — persistent query hook
- `react-native-ultrastore/atom` — atom helpers

See [API.md](./API.md), [llms.txt](./llms.txt), and [AI assistant rules](./.cursorrules).

## License

MIT © [Samad Khalid](https://github.com/SamadK01)
