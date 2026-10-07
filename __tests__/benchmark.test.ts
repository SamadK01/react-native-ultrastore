/**
 * UltraStore Performance Benchmark
 * Validates sub-millisecond execution for 10,000 read and write operations
 */

import { createStorage } from '../src/storage';

describe('UltraStore Performance Benchmark', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage({ id: 'benchmark-storage' });
    storage.clear();
  });

  afterEach(() => {
    storage.clear();
  });

  it('benchmark 10,000 scalar writes vs JSON object writes', () => {
    const ITERATIONS = 10000;

    // 1. Scalar String Writes
    const startScalarWrite = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      storage.set(`key_scalar_${i}`, `value_str_${i}`);
    }
    const durationScalarWrite = performance.now() - startScalarWrite;
    const avgScalarWriteMs = durationScalarWrite / ITERATIONS;

    // 2. Complex Object Writes
    const startObjectWrite = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      storage.set(`key_obj_${i}`, { id: i, name: `user_${i}`, active: true });
    }
    const durationObjectWrite = performance.now() - startObjectWrite;
    const avgObjectWriteMs = durationObjectWrite / ITERATIONS;

    console.log(`\n--- BENCHMARK RESULTS: 10,000 WRITES ---`);
    console.log(`Scalar Writes Total: ${durationScalarWrite.toFixed(2)} ms | Avg per op: ${avgScalarWriteMs.toFixed(4)} ms`);
    console.log(`Object Writes Total: ${durationObjectWrite.toFixed(2)} ms | Avg per op: ${avgObjectWriteMs.toFixed(4)} ms`);

    expect(avgScalarWriteMs).toBeLessThan(0.1); // Sub-millisecond guarantee (< 0.1 ms per op)
    expect(avgObjectWriteMs).toBeLessThan(0.2);
  });

  it('benchmark 10,000 scalar reads vs JSON object reads', () => {
    const ITERATIONS = 10000;

    // Pre-populate data
    for (let i = 0; i < ITERATIONS; i++) {
      storage.set(`key_scalar_${i}`, `value_str_${i}`);
      storage.set(`key_obj_${i}`, { id: i, name: `user_${i}`, active: true });
    }

    // 1. Scalar String Reads
    const startScalarRead = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      const val = storage.get<string>(`key_scalar_${i}`);
    }
    const durationScalarRead = performance.now() - startScalarRead;
    const avgScalarReadMs = durationScalarRead / ITERATIONS;

    // 2. Complex Object Reads
    const startObjectRead = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      const val = storage.get<{ id: number; name: string }>(`key_obj_${i}`);
    }
    const durationObjectRead = performance.now() - startObjectRead;
    const avgObjectReadMs = durationObjectRead / ITERATIONS;

    console.log(`\n--- BENCHMARK RESULTS: 10,000 READS ---`);
    console.log(`Scalar Reads Total: ${durationScalarRead.toFixed(2)} ms | Avg per op: ${avgScalarReadMs.toFixed(4)} ms`);
    console.log(`Object Reads Total: ${durationObjectRead.toFixed(2)} ms | Avg per op: ${avgObjectReadMs.toFixed(4)} ms`);

    expect(avgScalarReadMs).toBeLessThan(0.1); // Sub-millisecond guarantee (< 0.1 ms per op)
    expect(avgObjectReadMs).toBeLessThan(0.2);
  });
});
