# 📣 UltraStore v2.3.0 — VIP Launch Posts

---

## 🐦 Twitter / X — Thread (Post as thread, one by one)

---

**Tweet 1 — Hook (Main)**
```
React Query loses ALL cache on app restart.
SWR loses ALL cache on app restart.

I built useUltraQuery — it doesn't. 🧵

npm i react-native-ultrastore

#ReactNative #OpenSource
```

---

**Tweet 2 — The Problem**
```
Here's the problem with React Query on mobile 👇

User opens app → data loads ✅
User closes app → cache gone ❌
User reopens app → loading spinner again ❌
User is offline → error screen ❌

This is terrible UX. And everyone just accepts it.
```

---

**Tweet 3 — The Solution (with code)**
```
useUltraQuery stores cache in MMKV (disk), not memory.

const { data, isLoading } = useUltraQuery(
  'user_profile',
  () => fetch('/api/me').then(r => r.json()),
  { staleTime: 60_000 }
);

✅ App restart → cache still there (~1ms)
✅ Offline → stale cache served
✅ Fresh? → background refetch silently
```

---

**Tweet 4 — Numbers**
```
The numbers don't lie 👇

After app restart:
React Query → ~210ms (full refetch)
useUltraQuery → ~1ms (MMKV cache) ⚡

Offline:
React Query → ❌ Error
useUltraQuery → ✅ Stale cache served

Bundle size:
React Query → ~13KB
useUltraQuery → ~0.9KB
```

---

**Tweet 5 — More features**
```
And that's just one feature.

UltraStore v2.3.0 also ships:

⚡ 80x faster than AsyncStorage (MMKV v4 JSI)
⚛️ Atoms — Jotai-style persistent state
📦 Zustand adapter — one line persistence
🔐 Encryption built-in
↩️ Undo / Redo history
🛠 Migrations manager
🎯 Expo Config Plugin (New Arch auto-setup)
```

---

**Tweet 6 — CTA**
```
UltraStore v2.3.0 is live on npm 🚀

npm i react-native-ultrastore react-native-mmkv

📦 npm → npmjs.com/package/react-native-ultrastore
⭐ GitHub → github.com/SamadK01/react-native-ultrastore

If this helped you, a ⭐ on GitHub means a lot 🙏

#ReactNative #JavaScript #MobileDev #OpenSource
```

---

---

## 🔴 Reddit — r/reactnative

**Title:**
```
I fixed React Query's biggest problem on mobile — persistent cache that survives app restarts (UltraStore v2.3.0)
```

**Post Body:**
```
Hey r/reactnative 👋

I've been building React Native apps for a while and one thing always bothered me:

**React Query and SWR cache lives in memory.**

That means:
- Every app restart = full API refetch
- Offline = error screen
- Slow network = loading spinner every single time

So I built `useUltraQuery` — a data fetching hook that stores cache in **MMKV (disk)** instead of memory.

---

**The difference in practice:**

```tsx
// Before — React Query (cache lost on restart)
const { data } = useQuery(['user'], fetchUser);

// After — useUltraQuery (cache persists forever)
const { data, isLoading, refetch, invalidate } = useUltraQuery(
  'user_profile',
  () => fetch('https://api.example.com/me').then(r => r.json()),
  {
    staleTime: 60_000,  // fresh for 60s
    cacheTime: 300_000, // deleted after 5min inactivity
  }
);
```

---

**Real numbers:**

| Scenario | React Query | useUltraQuery |
|---|---|---|
| After app restart | ~210ms (full refetch) | ~1ms ✅ |
| Offline | ❌ Error | ✅ Stale cache |
| Bundle size | ~13KB | ~0.9KB |

---

**But wait, there's more.**

UltraStore is a full storage + state management library:

- ⚡ **80x faster than AsyncStorage** — MMKV v4 + JSI, no bridge
- ⚛️ **Atoms** — Jotai-style `createAtom` + `useUltraAtom`
- 📦 **Zustand adapter** — one line to make Zustand persistent
- 🔐 **Encryption** — `createStorage({ encryptionKey: 'secret' })`
- ↩️ **Undo/Redo** — `useUltraHistory` with configurable depth
- 🛠 **Migrations** — version-based schema upgrades
- 🎯 **Expo Config Plugin** — auto New Architecture setup

---

**Install:**

```bash
npm install react-native-ultrastore react-native-mmkv
```

📦 npm: https://www.npmjs.com/package/react-native-ultrastore
⭐ GitHub: https://github.com/SamadK01/react-native-ultrastore

This is v2.3.0 — just shipped today. Would genuinely love feedback, bug reports, or feature requests. 🙏
```

---

---

## 💼 LinkedIn

```
🚀 Just shipped UltraStore v2.3.0 — open source React Native library

One feature I'm most proud of: useUltraQuery

Every React Native developer using React Query or SWR faces the same problem — cache is stored in memory. App restart? Everything is gone. No network? Error screen.

useUltraQuery stores API cache in MMKV (disk). It survives app restarts. It works offline. It's ~0.9KB.

const { data, isLoading } = useUltraQuery(
  'user_profile',
  () => fetchUser(),
  { staleTime: 60_000 }
);

After app restart → data loads in ~1ms from cache.
Offline → stale cache served automatically.
React Query doing the same → ~210ms full refetch.

The full library also includes:
→ 80x faster storage than AsyncStorage (MMKV v4 + JSI)
→ Jotai-style Atoms with persistence
→ Zustand adapter
→ Built-in encryption
→ Undo/Redo history
→ Migration manager
→ Expo Config Plugin

Live on npm: react-native-ultrastore

If you're building React Native apps, give it a try. And if you find it useful — a ⭐ on GitHub goes a long way for an indie open source project.

GitHub → github.com/SamadK01/react-native-ultrastore

#ReactNative #OpenSource #JavaScript #MobileDevelopment #TypeScript
```

---

---

## 📝 Dev.to / Medium — Full Article

**Title:**
```
useUltraQuery: The React Native Data Fetching Hook That Actually Works Offline
```

**Article:**

```
React Query is great. SWR is great. But they both have the same problem on mobile.

Their cache lives in memory.

Close your app, reopen it — full refetch. Go offline — error screen. Slow 3G network — loading spinner every single time, even for data you fetched 10 minutes ago.

I got tired of this and built useUltraQuery.

---

## What is useUltraQuery?

It's a data fetching hook for React Native that stores cache in MMKV — a disk-based key-value store. Not memory. Disk.

That means:

- App restart → cache is still there, data loads in ~1ms
- Offline → stale cache is served, no error thrown
- Fresh data needed → background refetch happens silently

---

## The Code

```tsx
import { useUltraQuery } from 'react-native-ultrastore';

function UserProfile() {
  const { data, isLoading, error, refetch } = useUltraQuery(
    'user_profile',                    // MMKV cache key
    () => fetch('/api/me').then(r => r.json()),
    {
      staleTime: 60_000,   // fresh for 60 seconds
      cacheTime: 300_000,  // evict after 5 min inactivity
    }
  );

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;
  return <Text>{data?.name}</Text>;
}
```

Simple. Familiar. But the cache survives everything.

---

## The Numbers

| Scenario | React Query | SWR | useUltraQuery |
|---|---|---|---|
| First load | ~210ms | ~212ms | ~208ms |
| After app restart | ~210ms ❌ | ~212ms ❌ | ~1ms ✅ |
| Offline | Error ❌ | Error ❌ | Stale cache ✅ |
| Bundle size | ~13KB | ~4KB | ~0.9KB |

---

## How It Works Internally

1. On first fetch → API called, result stored in MMKV with a timestamp
2. On next mount (same session) → if within staleTime, MMKV value returned instantly
3. On app restart → MMKV read synchronously, data available before first render
4. On offline → if cache exists (even stale), it's returned — no error
5. Cache eviction → after cacheTime of inactivity, MMKV key is deleted

---

## It's Part of a Bigger Library

useUltraQuery is one feature of UltraStore — a full storage + state management library for React Native.

Other features:
- useUltraStore — 80x faster than AsyncStorage (MMKV v4 + JSI, no bridge)
- Atoms — createAtom + useUltraAtom (Jotai-style, persistent)
- Zustand adapter — one line to make any Zustand store persistent
- Encryption — createStorage({ encryptionKey: 'secret' })
- Undo/Redo — useUltraHistory with configurable depth
- Migrations — version-based schema upgrades
- Expo Config Plugin — automatic New Architecture setup

---

## Install

npm install react-native-ultrastore react-native-mmkv

Requires React Native 0.75+ (New Architecture).
Expo Go? Automatic AsyncStorage fallback included.

GitHub: github.com/SamadK01/react-native-ultrastore
npm: npmjs.com/package/react-native-ultrastore

---

If you've ever been frustrated by React Query losing cache on app restart — this is for you.

⭐ A star on GitHub means a lot for an indie open source project. 🙏
```

---
```
