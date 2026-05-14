# 📣 Community Outreach Posts — UltraStore v2.3.0

---

## 🔴 Reddit — r/reactnative

**Title:**
`I built the only React Native storage library with persistent API cache (survives app restarts) — UltraStore v2.3.0`

**Post:**
Hey r/reactnative 👋

I just released **UltraStore v2.3.0** — a storage + state management library for React Native built on MMKV v4.

The headline feature is `useUltraQuery` — a data fetching hook that **persists cache to disk via MMKV**.

Here's why that matters:

```tsx
const { data, isLoading, refetch } = useUltraQuery(
  'user_profile',
  () => fetch('https://api.example.com/me').then(r => r.json()),
  { staleTime: 60_000 }
);
```

**The problem with React Query / SWR on mobile:**
- Cache lives in memory only
- App restart = full refetch every time
- No network = error screen

**What useUltraQuery does differently:**
- Cache stored in MMKV (disk) — survives app restarts ✅
- Offline? Stale cache is served automatically ✅
- Bundle size ~0.9KB vs React Query's ~13KB ✅

Other features:
- `useUltraStore` — 80x faster than AsyncStorage
- Atoms (Jotai-style), Zustand adapter, Undo/Redo, Migrations, Encryption
- Expo Config Plugin for automatic New Architecture setup

**npm:** `npm install react-native-ultrastore react-native-mmkv`

GitHub: https://github.com/SamadK01/react-native-ultrastore
npm: https://www.npmjs.com/package/react-native-ultrastore

Would love feedback from the community! 🙏

---

## 🐦 Twitter / X

**Tweet 1 (Main announcement):**
```
🚀 UltraStore v2.3.0 is live on npm!

The only React Native library with persistent API cache that survives app restarts.

useUltraQuery stores your API cache in MMKV — not memory.

✅ Works offline
✅ Zero refetch on restart
✅ ~0.9KB bundle size

npm i react-native-ultrastore

#ReactNative #JavaScript #OpenSource
```

**Tweet 2 (useUltraQuery focus):**
```
React Query on mobile has one big problem 👇

Every app restart = full API refetch.
No network = error screen.

useUltraQuery from @ultrastore fixes this by caching to MMKV (disk).

Your data is there instantly — even offline.

github.com/SamadK01/react-native-ultrastore

#ReactNative #MobileDev
```

**Tweet 3 (Speed angle):**
```
AsyncStorage: ~4.8ms per write
MMKV v3 (bridge): ~0.18ms
UltraStore v2 (MMKV v4 JSI): ~0.06ms

80x faster. No bridge. No await.

react-native-ultrastore — now with Expo Config Plugin 🎉

#ReactNative #Performance #MMKV
```

---

## 📝 Medium / Dev.to Article

**Title:**
`Why I Built a React Native Storage Library That Beats React Query at Offline Caching`

**Outline:**

### Introduction
React Query and SWR are great — but they have a fundamental problem on mobile: their cache lives in memory. Every time a user restarts your app, all cached data is gone. On slow networks or offline, users see loading spinners or error screens instead of the data they already fetched yesterday.

UltraStore solves this with `useUltraQuery` — a hook that stores API cache in MMKV (disk), so it survives app restarts and works offline automatically.

### The Problem
```tsx
// React Query — cache gone on restart
const { data } = useQuery(['user'], fetchUser);

// useUltraQuery — cache persists in MMKV
const { data } = useUltraQuery('user', fetchUser, { staleTime: 60_000 });
```

### How It Works
- On first fetch: data fetched from API, stored in MMKV with a timestamp
- On next mount (same session): if within staleTime, MMKV cache returned instantly
- On app restart: MMKV cache read synchronously — no network call
- On offline: stale cache served, no error thrown

### Benchmarks
| Scenario | React Query | useUltraQuery |
|---|---|---|
| After app restart | ~210ms (full refetch) | ~1ms (MMKV cache) |
| Offline | ❌ Error | ✅ Stale cache |
| Bundle size | ~13KB | ~0.9KB |

### Other Features
- 80x faster than AsyncStorage
- Atoms, Zustand adapter, Undo/Redo, Migrations, Encryption
- Expo Config Plugin

### Conclusion
If you're building a React Native app that needs to work offline or feel instant on startup — give UltraStore a try.

`npm install react-native-ultrastore react-native-mmkv`

---
