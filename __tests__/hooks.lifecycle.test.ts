import React from 'react';
import { createStorage } from '../src/storage';
import { useUltraQuery } from '../src/hooks/useUltraQuery';
import { useUltraStore } from '../src/hooks/useUltraStore';

const TestRenderer = require('react-test-renderer') as {
  act: (callback: () => void | Promise<void>) => void | Promise<void>;
  create: (element: React.ReactElement) => {
    unmount: () => void;
    update: (element: React.ReactElement) => void;
  };
};

describe('hook lifecycle safety', () => {
  const storage = createStorage({ id: 'hook-lifecycle' });

  beforeEach(() => storage.clear());

  it('detaches persisted-store subscriptions across rapid mount cycles', () => {
    const Probe = () => {
      const [value] = useUltraStore('count', 0, storage);
      return React.createElement('value', { value });
    };

    for (let index = 0; index < 10; index += 1) {
      let renderer!: { unmount: () => void };
      TestRenderer.act(() => {
        renderer = TestRenderer.create(React.createElement(Probe));
      });
      TestRenderer.act(() => renderer.unmount());
      storage.set('count', index);
    }

    expect(storage.get('count')).toBe(9);
  });

  it('ignores an earlier query when the key changes before it resolves', async () => {
    const pending = new Map<string, (value: string) => void>();
    let latestData: string | undefined;

    const Probe = ({ queryKey }: { queryKey: string }) => {
      const query = useUltraQuery(
        queryKey,
        () =>
          new Promise<string>((resolve) => {
            pending.set(queryKey, resolve);
          }),
        { storage }
      );
      latestData = query.data;
      return null;
    };

    let renderer!: {
      update: (element: React.ReactElement) => void;
      unmount: () => void;
    };
    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(
        React.createElement(Probe, { queryKey: 'first' })
      );
    });
    await TestRenderer.act(async () => {
      renderer.update(React.createElement(Probe, { queryKey: 'second' }));
    });
    await TestRenderer.act(async () => {
      pending.get('first')!('obsolete');
    });

    expect(latestData).toBeUndefined();

    await TestRenderer.act(async () => {
      pending.get('second')!('current');
    });
    expect(latestData).toBe('current');
    TestRenderer.act(() => renderer.unmount());
  });
});
