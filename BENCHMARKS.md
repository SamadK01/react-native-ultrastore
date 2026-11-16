# Benchmarking UltraStore

UltraStore's automated benchmark is a regression check, not a published device-performance claim. It exercises scalar and object reads/writes in the test runtime and asserts scalar operations remain below 0.1 ms there. It does not measure a production React Native JSI build, disk durability, or an AsyncStorage comparison.

## Measure a release build

1. Build a release app with the New Architecture and linked MMKV v4.
2. Benchmark separately on every target device and JS engine.
3. Include warm-up, payload size, iteration count, and percentile results.
4. Separate storage time from React render time and network time.
5. Benchmark vectors with corpus size, dimension, `topK`, cache state, and serialization cost reported independently.

```ts
const iterations = 10_000;
const startedAt = performance.now();
for (let index = 0; index < iterations; index += 1) {
  storage.set(`scalar:${index}`, index);
}
const millisecondsPerOperation = (performance.now() - startedAt) / iterations;
```

## Interpreting results

Native MMKV scalar operations are synchronous and avoid JSON for strings, numbers, and booleans. Objects still serialize. Vector similarity is a linear in-memory scan and persistent vector writes include Base64 conversion. `batchSet` batches subscriber visibility; it is not evidence of native transactional or bulk-write speed.
