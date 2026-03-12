# API Reference (v2.0.0)

Complete API documentation for react-native-ultrastore.

## Hooks

### `useUltraStore`
Main hook for state + persistence.
```tsx
function useUltraStore<T>(key: string, initialValue: T, storage?: StorageEngine): [T, (action: SetStateAction<T>) => void]
```

### `useUltraAtom` (New!)
Hook for consuming atomic state.
```tsx
function useUltraAtom<T>(atom: Atom<T>): [T, (action: SetStateAction<T>) => void]
```

### `useBatchUpdate` (New!)
Hook for updating multiple keys in one operation.
```tsx
function useBatchUpdate(storage?: StorageEngine): (updates: Record<string, any>) => void
```

---

## Atoms

### `createAtom` (New!)
Create a composable, atomic unit of state.
```tsx
function createAtom<T>(key: string, initialValue: T, storage?: StorageEngine): Atom<T>
```

---

## Batching

### `batchSet` (New!)
Utility to update multiple keys without redundant renders.
```tsx
function batchSet(updates: Record<string, any>, storage?: StorageEngine): void
```

---

## Zustand Adapter

### `createUltraZustandStorage` (New!)
Zustand-compatible storage adapter.
```tsx
function createUltraZustandStorage(storage?: StorageEngine): StateStorage
```

---

## Storage

### `StorageEngine`
Core storage engine powered by MMKV v4 + Nitro Modules.

#### Methods
- `get<T>(key: string): T | undefined`
- `set<T>(key: string, value: T): void`
- `delete(key: string): void` (Uses `.remove()` internally in v2)
- `has(key: string): boolean`
- `clear(): void`
- `getAllKeys(): string[]`
- `use(middleware: Middleware): void`

---

## Middlewares

### `createDevToolsMiddleware` (New!)
Inspect state changes in Metro console and `global.__ULTRASTORE_STATE__`.

### `createLoggerMiddleware`
Standard console logging middleware.

### `createValidatorMiddleware`
Middleware for state validation.
