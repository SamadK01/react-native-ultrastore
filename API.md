# API Reference

Complete API documentation for react-native-ultrastore.

## Hooks

### `useUltraStore`

Main hook for state + persistence.

```tsx
function useUltraStore<T>(
  key: string,
  initialValue: T,
  storage?: StorageEngine
): [T, (action: SetStateAction<T>) => void]
```

**Parameters:**
- `key` - Unique identifier for the store
- `initialValue` - Default value if not persisted
- `storage` - Optional custom storage instance

**Returns:**
- `[value, setValue]` - Current value and setter function

**Example:**
```tsx
const [user, setUser] = useUltraStore('user', { name: '', email: '' });
```

---

### `useUltraStoreSelector`

Subscribe to partial state for optimized re-renders.

```tsx
function useUltraStoreSelector<T, R>(
  key: string,
  selector: (state: T) => R,
  initialValue: T,
  storage?: StorageEngine
): R
```

**Parameters:**
- `key` - Store key
- `selector` - Function to select portion of state
- `initialValue` - Default value for the store
- `storage` - Optional custom storage instance

**Returns:**
- Selected value

**Example:**
```tsx
const userName = useUltraStoreSelector(
  'user',
  (user) => user.name,
  { name: '', email: '' }
);
```

---

### `useUltraStoreValue`

Read-only hook for accessing store value.

```tsx
function useUltraStoreValue<T>(
  key: string,
  initialValue: T,
  storage?: StorageEngine
): T
```

**Parameters:**
- `key` - Store key
- `initialValue` - Default value if not persisted
- `storage` - Optional custom storage instance

**Returns:**
- Current value (read-only)

**Example:**
```tsx
const user = useUltraStoreValue('user', { name: '', email: '' });
```

---

### `useUltraStoreSetter`

Write-only hook for updating store value.

```tsx
function useUltraStoreSetter<T>(
  key: string,
  initialValue: T,
  storage?: StorageEngine
): (action: SetStateAction<T>) => void
```

**Parameters:**
- `key` - Store key
- `initialValue` - Default value if not persisted
- `storage` - Optional custom storage instance

**Returns:**
- Setter function (write-only)

**Example:**
```tsx
const setUser = useUltraStoreSetter('user', { name: '', email: '' });
setUser({ name: 'Samad', email: 'samad@example.com' });
```

---

## Storage

### `StorageEngine`

Core storage engine powered by MMKV.

#### Methods

##### `get<T>(key: string): T | undefined`

Get value from storage.

```tsx
const value = storage.get<User>('user');
```

##### `set<T>(key: string, value: T): void`

Set value in storage.

```tsx
storage.set('user', { name: 'Samad' });
```

##### `delete(key: string): void`

Delete value from storage.

```tsx
storage.delete('user');
```

##### `has(key: string): boolean`

Check if key exists.

```tsx
if (storage.has('user')) {
  // Key exists
}
```

##### `clear(): void`

Clear all data.

```tsx
storage.clear();
```

##### `getAllKeys(): string[]`

Get all keys.

```tsx
const keys = storage.getAllKeys();
```

##### `use(middleware: Middleware): void`

Add middleware.

```tsx
storage.use(createLoggerMiddleware());
```

---

### `defaultStorage`

Default storage instance.

```tsx
import { defaultStorage } from 'react-native-ultrastore';

defaultStorage.set('key', 'value');
```

---

### `createStorage`

Create custom storage instance.

```tsx
function createStorage(options?: UltraStoreOptions): StorageEngine
```

**Options:**
- `id` - Custom instance ID
- `encryptionKey` - Encryption key for secure storage

**Example:**
```tsx
const secureStorage = createStorage({
  id: 'secure',
  encryptionKey: 'my-secret-key'
});
```

---

## Utilities

### `createNamespace`

Create namespaced storage instance.

```tsx
function createNamespace(
  namespace: string,
  options?: Omit<UltraStoreOptions, 'id'>
): StorageEngine
```

**Example:**
```tsx
const userStorage = createNamespace('user');
const cartStorage = createNamespace('cart');
```

---

### `clearAll`

Clear all data from default storage.

```tsx
function clearAll(): void
```

**Example:**
```tsx
import { clearAll } from 'react-native-ultrastore';

clearAll(); // Clears everything
```

---

### `removeKey`

Remove specific key from storage.

```tsx
function removeKey(key: string): void
```

**Example:**
```tsx
import { removeKey } from 'react-native-ultrastore';

removeKey('user');
```

---

### `getAllKeys`

Get all keys from storage.

```tsx
function getAllKeys(): string[]
```

**Example:**
```tsx
import { getAllKeys } from 'react-native-ultrastore';

const keys = getAllKeys();
console.log(keys); // ['user', 'cart', 'settings']
```

---

## Middleware

### `createLoggerMiddleware`

Create logger middleware for debugging.

```tsx
function createLoggerMiddleware(options?: {
  collapsed?: boolean;
  colors?: boolean;
}): Middleware
```

**Options:**
- `collapsed` - Collapse console groups (default: false)
- `colors` - Use colored output (default: true)

**Example:**
```tsx
import { defaultStorage, createLoggerMiddleware } from 'react-native-ultrastore';

defaultStorage.use(createLoggerMiddleware({ collapsed: true }));
```

---

### `createValidatorMiddleware`

Create validator middleware.

```tsx
function createValidatorMiddleware<T>(rules: {
  [key: string]: ValidationRule<T>;
}): Middleware<T>

type ValidationRule<T> = (value: T) => boolean | string;
```

**Example:**
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

---

## Types

### `SetStateAction<T>`

```tsx
type SetStateAction<T> = T | ((prevState: T) => T);
```

### `Selector<T, R>`

```tsx
type Selector<T, R> = (state: T) => R;
```

### `Middleware<T>`

```tsx
interface Middleware<T = any> {
  onBeforeSet?: (key: string, value: T, oldValue: T | undefined) => T | void;
  onAfterSet?: (key: string, value: T) => void;
  onBeforeGet?: (key: string) => void;
  onAfterGet?: (key: string, value: T | undefined) => void;
  onDelete?: (key: string) => void;
}
```

### `UltraStoreOptions`

```tsx
interface UltraStoreOptions {
  encryptionKey?: string;
  id?: string;
}
```

---

## Advanced Usage

### Custom Middleware

Create your own middleware:

```tsx
const customMiddleware: Middleware = {
  onBeforeSet: (key, value, oldValue) => {
    console.log(`Setting ${key}:`, value);
    // Transform value if needed
    return value;
  },
  onAfterSet: (key, value) => {
    console.log(`Set ${key} successfully`);
  },
  onDelete: (key) => {
    console.log(`Deleted ${key}`);
  },
};

defaultStorage.use(customMiddleware);
```

### Multiple Storage Instances

```tsx
const userStorage = createStorage({ id: 'user' });
const cartStorage = createStorage({ id: 'cart' });
const secureStorage = createStorage({ 
  id: 'secure',
  encryptionKey: 'secret-key' 
});

// Use different instances
const [user, setUser] = useUltraStore('profile', {}, userStorage);
const [cart, setCart] = useUltraStore('items', [], cartStorage);
const [token, setToken] = useUltraStore('token', '', secureStorage);
```

### Performance Optimization

```tsx
// ❌ Bad: Re-renders on any user change
const [user, setUser] = useUltraStore('user', { name: '', email: '', age: 0 });

// ✅ Good: Only re-renders when name changes
const userName = useUltraStoreSelector(
  'user',
  (user) => user.name,
  { name: '', email: '', age: 0 }
);

// ✅ Good: Write-only, no re-renders
const setUser = useUltraStoreSetter('user', { name: '', email: '', age: 0 });
```
