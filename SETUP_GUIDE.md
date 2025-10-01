# 📦 Setup Guide for react-native-ultrastore

Complete guide to get started with UltraStore in your React Native project.

## Table of Contents

- [Installation](#installation)
- [React Native CLI Setup](#react-native-cli-setup)
- [Expo Setup](#expo-setup)
- [TypeScript Configuration](#typescript-configuration)
- [Troubleshooting](#troubleshooting)

---

## Installation

### For React Native CLI Projects

```bash
# Using npm
npm install react-native-ultrastore react-native-mmkv

# Using yarn
yarn add react-native-ultrastore react-native-mmkv

# For iOS, install pods
cd ios && pod install && cd ..
```

### For Expo Projects

```bash
# Install packages
npx expo install react-native-ultrastore react-native-mmkv

# Create development build (required for native modules)
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

**Note**: Expo Go does NOT support native modules. You must use a development build.

---

## React Native CLI Setup

### 1. Install Dependencies

```bash
yarn add react-native-ultrastore react-native-mmkv
```

### 2. iOS Setup

```bash
cd ios && pod install && cd ..
```

### 3. Android Setup

No additional setup required! Auto-linking handles everything.

### 4. Start Using

```tsx
import { useUltraStore } from 'react-native-ultrastore';

function App() {
  const [user, setUser] = useUltraStore('user', { name: '' });
  
  return <Text>{user.name}</Text>;
}
```

---

## Expo Setup

### Prerequisites

- Expo SDK 48+
- EAS CLI installed: `npm install -g eas-cli`

### Steps

1. **Install packages**

```bash
npx expo install react-native-ultrastore react-native-mmkv
```

2. **Create development build**

```bash
# Generate native code
npx expo prebuild

# Build for iOS (requires Mac)
npx expo run:ios

# Build for Android
npx expo run:android
```

3. **For EAS Build** (optional)

Create `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

Build:

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

---

## TypeScript Configuration

UltraStore is written in TypeScript and provides full type safety.

### Basic Usage

```tsx
interface User {
  id: string;
  name: string;
  email: string;
}

const [user, setUser] = useUltraStore<User>('user', {
  id: '',
  name: '',
  email: '',
});

// TypeScript will enforce the User interface
setUser({ id: '1', name: 'Samad', email: 'samad@example.com' });
```

### Custom Types

```tsx
type Theme = 'light' | 'dark' | 'auto';

const [theme, setTheme] = useUltraStore<Theme>('theme', 'light');

// TypeScript will only allow 'light', 'dark', or 'auto'
setTheme('dark'); // ✅ Valid
setTheme('blue'); // ❌ TypeScript error
```

---

## Troubleshooting

### iOS Issues

**Problem**: `'MMKV/MMKV.h' file not found`

**Solution**:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Problem**: Build fails after installation

**Solution**:
```bash
# Clean build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Clean Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Android Issues

**Problem**: `Could not find react-native-mmkv`

**Solution**:
```bash
cd android
./gradlew clean
cd ..
```

**Problem**: Metro bundler cache issues

**Solution**:
```bash
yarn start --reset-cache
```

### Expo Issues

**Problem**: "Invariant Violation: Native module cannot be null"

**Solution**: You're using Expo Go. Create a development build:
```bash
npx expo prebuild
npx expo run:ios  # or run:android
```

**Problem**: Build fails with EAS

**Solution**: Ensure `eas.json` is configured correctly and you have the latest EAS CLI:
```bash
npm install -g eas-cli@latest
eas build --profile development --platform all
```

### General Issues

**Problem**: Data not persisting

**Solution**: 
1. Check if you're using the same key across app restarts
2. Ensure the app has storage permissions (Android)
3. Check if you're calling `clearAll()` somewhere

**Problem**: TypeScript errors

**Solution**:
```bash
# Regenerate types
yarn typecheck

# Clear TypeScript cache
rm -rf node_modules/.cache
```

**Problem**: Performance issues

**Solution**:
1. Use selectors for large objects
2. Avoid storing very large data (>1MB per key)
3. Use namespaces to separate concerns

---

## Verification

After setup, verify everything works:

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUltraStore } from 'react-native-ultrastore';

function TestApp() {
  const [count, setCount] = useUltraStore('test-count', 0);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Count: {count}</Text>
      <Button title="Increment" onPress={() => setCount(c => c + 1)} />
    </View>
  );
}

export default TestApp;
```

If the counter persists after app restart, you're all set! 🎉

---

## Next Steps

- Read the [README.md](./README.md) for API documentation
- Check [EXAMPLE_USAGE.md](./EXAMPLE_USAGE.md) for more examples
- Run the example app: `cd example && yarn install && yarn ios`

## Need Help?

- 📖 [Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/yourusername/react-native-ultrastore/issues)
- 💬 [Discussions](https://github.com/yourusername/react-native-ultrastore/discussions)
