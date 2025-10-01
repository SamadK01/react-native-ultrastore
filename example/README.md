# UltraStore Example App

This is a demo React Native CLI app showcasing all features of `react-native-ultrastore`.

## Features Demonstrated

- ✅ Basic state + persistence with `useUltraStore`
- ✅ Namespaces for isolated stores
- ✅ Selectors for optimized re-renders
- ✅ Shopping cart example
- ✅ User authentication flow
- ✅ Theme management
- ✅ Utility functions (clearAll, getAllKeys)
- ✅ Logger middleware

## Running the Example

### Prerequisites

- Node.js >= 18
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and SDK

### Installation

```bash
# Install dependencies
yarn install

# For iOS
cd ios && pod install && cd ..

# Run on iOS
yarn ios

# Run on Android
yarn android
```

## Project Structure

```
example/
├── App.tsx              # Main demo app
├── package.json         # Dependencies
└── README.md           # This file
```

## What to Try

1. **User Management**: Login/logout with persistence
2. **Shopping Cart**: Add/remove items, see total
3. **Counter**: Increment/decrement with selector demo
4. **Theme**: Switch between light/dark/auto
5. **Utilities**: View all keys, clear all data

## Tips

- Open React Native Debugger to see MMKV operations
- Close and reopen the app to see persistence in action
- Check the console for logger middleware output
