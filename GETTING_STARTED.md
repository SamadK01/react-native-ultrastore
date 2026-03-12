# 🚀 Getting Started with UltraStore v2.0.0

Welcome! This guide will help you get started with the fastest storage + state management library for React Native in 2026.

## Prerequisites

- Node.js 18+
- **React Native 0.75+** (Required for Nitro Modules support)
- React 18+
- iOS 12+ / Android API 21+

## Installation

### Step 1: Install Packages

```bash
# Using npm
npm install react-native-ultrastore react-native-mmkv react-native-nitro-modules

# Using yarn
yarn add react-native-ultrastore react-native-mmkv react-native-nitro-modules
```

### Step 2: iOS Setup

```bash
cd ios
pod install
cd ..
```

---

## 🏗️ Core Concepts (v2 Features)

### 1. Basic Persistence
```tsx
import { useUltraStore } from 'react-native-ultrastore';

const [count, setCount] = useUltraStore('count', 0);
```

### 2. Atomic State (Atoms)
Atoms are composable units of state that automatically persist to disk.
```tsx
import { createAtom, useUltraAtom } from 'react-native-ultrastore';

const userAtom = createAtom('user', { name: 'Samad' });

function Profile() {
  const [user, setUser] = useUltraAtom(userAtom);
}
```

### 3. Batching for Performance
Update multiple keys without bridge overhead.
```tsx
import { batchSet } from 'react-native-ultrastore';

batchSet({ key1: 'val1', key2: 'val2' });
```

### 4. DevTools
Inspect your state live in the console.
```tsx
import { defaultStorage, createDevToolsMiddleware } from 'react-native-ultrastore';

if (__DEV__) {
  defaultStorage.use(createDevToolsMiddleware());
}
```

## Environment Fallbacks
UltraStore is designed to work everywhere:
- **Expo Go:** Gracefully falls back to an in-memory store (no persistence).
- **Web:** Automatically uses `localStorage`.

---

## Next Steps

- 📖 Read the [full documentation](./README.md)
- 🎨 Explore [more examples](./EXAMPLE_USAGE.md)
- 📚 Check the [API reference](./API.md)

---

**Happy coding! 🎉**
