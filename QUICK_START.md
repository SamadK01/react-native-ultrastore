# ⚡ Quick Start (v2.0.0)

Get started with react-native-ultrastore in 5 minutes.

## Installation

```bash
# Install required packages
npm install react-native-ultrastore react-native-mmkv react-native-nitro-modules

# For iOS
cd ios && pod install
```

> [!IMPORTANT]
> **React Native 0.75+ required** for MMKV v4 + Nitro Modules support.

## 1. Basic Hook
```tsx
import { useUltraStore } from 'react-native-ultrastore';

const [count, setCount] = useUltraStore('count', 0);
```

## 2. Atomic State (New!)
```tsx
import { createAtom, useUltraAtom } from 'react-native-ultrastore';

const themeAtom = createAtom('theme', 'dark');

function Component() {
  const [theme, setTheme] = useUltraAtom(themeAtom);
}
```

## 3. Batch Updates (New!)
```tsx
import { batchSet } from 'react-native-ultrastore';

batchSet({
  'is_logged_in': true,
  'last_login': Date.now()
}); // Unified update, zero bridge overhead.
```

## 4. Zustand Integration (New!)
```ts
import { createUltraZustandStorage } from 'react-native-ultrastore/zustand';

// Use as your persist storage
storage: createJSONStorage(() => createUltraZustandStorage())
```

---

## Why v2?
- 🚀 **Nitro Powered:** Uses direct C++ bindings for zero-bridge speed.
- ⚛️ **Atoms:** Composable, atomic state units.
- 🧪 **Expo Go:** Built-in safe fallbacks.
- 🌐 **Web:** Native `localStorage` support.

## Next Steps

- 📖 Read the [full documentation](./README.md)
- 🎨 Check out [more examples](./EXAMPLE_USAGE.md)
- 📚 Explore the [API reference](./API.md)
