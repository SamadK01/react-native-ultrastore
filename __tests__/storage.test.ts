/**
 * Storage Engine Tests
 */

import { createStorage } from '../src/storage';
import { createMigrationManager } from '../src/migrations';

describe('StorageEngine', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage({ id: 'test-storage' });
    storage.clear();
  });

  it('should use the native MMKV backend in the test environment', () => {
    expect(storage.getUsingFallback()).toBe(false);
  });

  afterEach(() => {
    storage.clear();
  });

  it('should set and get values', () => {
    storage.set('key1', 'value1');
    expect(storage.get('key1')).toBe('value1');
  });

  it('should handle objects', () => {
    const obj = { name: 'Samad', age: 25 };
    storage.set('user', obj);
    expect(storage.get('user')).toEqual(obj);
  });

  it('returns undefined for a corrupted JSON payload', () => {
    storage.getRawStorage()!.set('corrupted', 'j:{not-json');

    expect(storage.get('corrupted')).toBeUndefined();
  });

  it('runs migrations from an absent or malformed stored version', async () => {
    const migrateOne = jest.fn((db) => db.set('migrated', true));
    storage.set('@ultraStore:version', 'not-a-version');

    await createMigrationManager(storage, {
      targetVersion: 1,
      migrations: { 1: migrateOne },
    });

    expect(migrateOne).toHaveBeenCalledWith(storage);
    expect(storage.get('migrated')).toBe(true);
    expect(storage.get('@ultraStore:version')).toBe(1);
  });

  it('does not advance the schema version when a migration fails', async () => {
    storage.set('@ultraStore:version', 1);
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    await createMigrationManager(storage, {
      targetVersion: 2,
      migrations: {
        2: () => {
          throw new Error('migration failed');
        },
      },
    });

    expect(storage.get('@ultraStore:version')).toBe(1);
    error.mockRestore();
  });

  it('rejects an invalid target schema version', async () => {
    await expect(
      createMigrationManager(storage, {
        targetVersion: 1.5,
        migrations: {},
      })
    ).rejects.toThrow('targetVersion must be a non-negative integer');
  });

  it('should handle arrays', () => {
    const arr = [1, 2, 3, 4, 5];
    storage.set('numbers', arr);
    expect(storage.get('numbers')).toEqual(arr);
  });

  it('should delete values', () => {
    storage.set('key1', 'value1');
    expect(storage.has('key1')).toBe(true);
    storage.delete('key1');
    expect(storage.has('key1')).toBe(false);
  });

  it('should clear all values', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');
    storage.clear();
    expect(storage.getAllKeys()).toHaveLength(0);
  });

  it('should get all keys', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');
    const keys = storage.getAllKeys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
  });

  it('should handle middleware', () => {
    const middleware = {
      onBeforeSet: jest.fn((key, value) => value),
      onAfterSet: jest.fn(),
    };

    storage.use(middleware);
    storage.set('key1', 'value1');

    expect(middleware.onBeforeSet).toHaveBeenCalledWith(
      'key1',
      'value1',
      undefined
    );
    expect(middleware.onAfterSet).toHaveBeenCalledWith('key1', 'value1');
  });

  it('should commit a batch before sending one batch notification', () => {
    const listener = jest.fn();
    storage.onBatchChange(listener);

    storage.setMany({ first: 1, second: 2 });

    expect(storage.get('first')).toBe(1);
    expect(storage.get('second')).toBe(2);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toEqual(
      new Map([
        ['first', 1],
        ['second', 2],
      ])
    );
  });

  it('should invalidate every active key listener when cleared', () => {
    const first = jest.fn();
    const second = jest.fn();
    storage.onChange('first', first);
    storage.onChange('second', second);

    storage.setMany({ first: 'one', second: 'two' });
    first.mockClear();
    second.mockClear();
    storage.clear();

    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith(undefined);
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(undefined);
  });

  it('should isolate values between storage namespaces', () => {
    const otherStorage = createStorage({ id: 'other-test-storage' });
    otherStorage.clear();

    storage.set('shared-key', 'primary');
    otherStorage.set('shared-key', 'secondary');

    expect(storage.get('shared-key')).toBe('primary');
    expect(otherStorage.get('shared-key')).toBe('secondary');
  });
});
