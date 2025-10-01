# UltraStore Example Usage

## Basic Usage

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUltraStore } from 'react-native-ultrastore';

function UserProfile() {
  const [user, setUser] = useUltraStore('user', { 
    name: '', 
    email: '',
    token: '' 
  });

  return (
    <View>
      <Text>Name: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      
      <Button
        title="Update User"
        onPress={() => setUser({ 
          name: 'Samad', 
          email: 'samad@example.com',
          token: 'abc123' 
        })}
      />
      
      <Button
        title="Update Name Only"
        onPress={() => setUser(prev => ({ ...prev, name: 'Ali' }))}
      />
    </View>
  );
}
```

## Advanced: Selectors (Optimized Re-renders)

```tsx
import { useUltraStoreSelector } from 'react-native-ultrastore';

function UserName() {
  // Only re-renders when user.name changes
  const userName = useUltraStoreSelector(
    'user',
    (user) => user.name,
    { name: '', email: '', token: '' }
  );

  return <Text>{userName}</Text>;
}
```

## Advanced: Namespaces

```tsx
import { createNamespace, useUltraStore } from 'react-native-ultrastore';

// Create separate namespaces
const userStorage = createNamespace('user');
const cartStorage = createNamespace('cart');

function App() {
  const [profile, setProfile] = useUltraStore('profile', {}, userStorage);
  const [items, setItems] = useUltraStore('items', [], cartStorage);

  // These stores are completely isolated
  return <View>...</View>;
}
```

## Advanced: Middleware (Logging)

```tsx
import { defaultStorage, createLoggerMiddleware } from 'react-native-ultrastore';

// Enable logging in development
if (__DEV__) {
  defaultStorage.use(createLoggerMiddleware({ collapsed: true }));
}
```

## Advanced: Validation

```tsx
import { defaultStorage, createValidatorMiddleware } from 'react-native-ultrastore';

defaultStorage.use(
  createValidatorMiddleware({
    user: (value) => {
      if (!value.name) return 'Name is required';
      if (!value.email) return 'Email is required';
      return true;
    },
  })
);
```

## Advanced: Encryption

```tsx
import { createStorage, useUltraStore } from 'react-native-ultrastore';

// Create encrypted storage for sensitive data
const secureStorage = createStorage({ 
  id: 'secure',
  encryptionKey: 'your-encryption-key-here' 
});

function SecureData() {
  const [token, setToken] = useUltraStore('auth-token', '', secureStorage);
  
  return <View>...</View>;
}
```

## Utility Functions

```tsx
import { clearAll, removeKey, getAllKeys } from 'react-native-ultrastore';

// Clear all data (e.g., on logout)
clearAll();

// Remove specific key
removeKey('user');

// Get all stored keys
const keys = getAllKeys();
console.log(keys); // ['user', 'cart', 'settings']
```

## Read-Only / Write-Only Hooks

```tsx
import { useUltraStoreValue, useUltraStoreSetter } from 'react-native-ultrastore';

// Read-only (no re-render on update from this component)
function DisplayUser() {
  const user = useUltraStoreValue('user', { name: '' });
  return <Text>{user.name}</Text>;
}

// Write-only (no re-render when value changes)
function UpdateUser() {
  const setUser = useUltraStoreSetter('user', { name: '' });
  
  return (
    <Button 
      title="Update" 
      onPress={() => setUser({ name: 'New Name' })} 
    />
  );
}
```

## TypeScript Support

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

function TypedExample() {
  const [user, setUser] = useUltraStore<User>('user', {
    id: '',
    name: '',
    email: '',
    age: 0,
  });

  // Full type safety and autocomplete
  setUser({
    id: '1',
    name: 'Samad',
    email: 'samad@example.com',
    age: 25,
  });

  return <Text>{user.name}</Text>;
}
```

## Shopping Cart Example

```tsx
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function ShoppingCart() {
  const [cart, setCart] = useUltraStore<CartItem[]>('cart', []);

  const addItem = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View>
      <Text>Total: ${total}</Text>
      {cart.map(item => (
        <View key={item.id}>
          <Text>{item.name} x {item.quantity}</Text>
          <Button title="Remove" onPress={() => removeItem(item.id)} />
        </View>
      ))}
    </View>
  );
}
```
