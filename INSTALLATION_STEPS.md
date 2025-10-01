# 📦 Installation Steps

Follow these steps to install and use **react-native-ultrastore** in your project.

## For New Projects

### Step 1: Install Dependencies

```bash
yarn add react-native-ultrastore react-native-mmkv
```

### Step 2: iOS Setup (Mac only)

```bash
cd ios && pod install && cd ..
```

### Step 3: Start Using

```tsx
import { useUltraStore } from 'react-native-ultrastore';

function App() {
  const [user, setUser] = useUltraStore('user', { name: '' });
  return <Text>{user.name}</Text>;
}
```

**That's it!** ✅

---

## For Existing Projects

### Option A: Quick Migration from AsyncStorage

```bash
# Install UltraStore
yarn add react-native-ultrastore react-native-mmkv
cd ios && pod install && cd ..

# Replace AsyncStorage imports
# Before: import AsyncStorage from '@react-native-async-storage/async-storage';
# After:  import { useUltraStore } from 'react-native-ultrastore';
```

### Option B: Side-by-side with Redux

You can use UltraStore alongside Redux:

```tsx
// Redux for complex state logic
import { useSelector, useDispatch } from 'react-redux';

// UltraStore for simple persistent state
import { useUltraStore } from 'react-native-ultrastore';

function MyComponent() {
  // Redux
  const reduxState = useSelector(state => state.complex);
  
  // UltraStore
  const [settings, setSettings] = useUltraStore('settings', {});
  
  return <View>...</View>;
}
```

---

## For Expo Projects

```bash
# Install packages
npx expo install react-native-ultrastore react-native-mmkv

# Create development build (REQUIRED - Expo Go won't work)
npx expo prebuild

# Run
npx expo run:ios    # or run:android
```

**Note**: Native modules require a development build, not Expo Go.

---

## Verification

Test that everything works:

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUltraStore } from 'react-native-ultrastore';

export default function TestScreen() {
  const [count, setCount] = useUltraStore('test-counter', 0);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 48 }}>{count}</Text>
      <Button title="Increment" onPress={() => setCount(c => c + 1)} />
      <Text style={{ marginTop: 20, color: 'gray' }}>
        Close and reopen the app - your count persists!
      </Text>
    </View>
  );
}
```

**Test checklist:**
- [ ] Counter increments when you press the button
- [ ] Close the app completely
- [ ] Reopen the app
- [ ] Counter value is still there ✅

---

## Troubleshooting

### iOS Build Errors

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android Build Errors

```bash
cd android
./gradlew clean
cd ..
yarn start --reset-cache
```

### TypeScript Errors

```bash
rm -rf node_modules
yarn install
```

### "Native module cannot be null" (Expo)

You're using Expo Go. Create a development build:

```bash
npx expo prebuild
npx expo run:ios
```

---

## Next Steps

✅ **Installation complete!**

Now explore:
- 📖 [Getting Started Guide](./GETTING_STARTED.md)
- 🎨 [Usage Examples](./EXAMPLE_USAGE.md)
- 📚 [API Reference](./API.md)
- 🚀 [Example App](./example/README.md)

---

## Need Help?

- 🐛 [Report Issues](https://github.com/yourusername/react-native-ultrastore/issues)
- 💬 [Discussions](https://github.com/yourusername/react-native-ultrastore/discussions)
