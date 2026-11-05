/**
 * Store Tests
 */

import { Store, getStore } from '../src/store';
import { createStorage } from '../src/storage';

describe('Store', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage({ id: 'test-store' });
    storage.clear();
  });

  afterEach(() => {
    storage.clear();
  });

  it('should initialize with initial value', () => {
    const store = new Store('test', 'initial', storage);
    expect(store.getValue()).toBe('initial');
  });

  it('should update value', () => {
    const store = new Store('test', 'initial', storage);
    store.setValue('updated');
    expect(store.getValue()).toBe('updated');
  });

  it('should notify listeners on change', () => {
    const store = new Store('test', 0, storage);
    const listener = jest.fn();

    store.subscribe(listener);
    store.setValue(1);

    expect(listener).toHaveBeenCalledWith(1);
  });

  it('should unsubscribe listeners', () => {
    const store = new Store('test', 0, storage);
    const listener = jest.fn();

    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setValue(1);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should handle function updates', () => {
    const store = new Store('test', 0, storage);
    store.setValue((prev) => prev + 1);
    expect(store.getValue()).toBe(1);
  });

  it('should persist value', () => {
    const store1 = new Store('test', 'initial', storage);
    store1.setValue('persisted');

    // Create new store with same key
    const store2 = new Store('test', 'initial', storage);
    expect(store2.getValue()).toBe('persisted');
  });

  it('should reset active stores when storage is cleared', () => {
    const store = new Store('test', 'initial', storage);
    const listener = jest.fn();
    store.subscribe(listener);
    store.setValue('updated');
    listener.mockClear();

    storage.clear();

    expect(store.getValue()).toBe('initial');
    expect(listener).toHaveBeenCalledWith('initial');
  });

  it('should remove a deleted store from the registry', () => {
    const first = getStore('deletable', 'initial', storage);
    first.setValue('updated');
    first.delete();

    const replacement = getStore('deletable', 'replacement', storage);

    expect(replacement).not.toBe(first);
    expect(replacement.getValue()).toBe('replacement');
  });
});
