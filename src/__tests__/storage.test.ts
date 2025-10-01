/**
 * Storage Engine Tests
 */

import { createStorage } from '../storage';

describe('StorageEngine', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage({ id: 'test-storage' });
    storage.clear();
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
});
