/**
 * AI Edge-Cache & Vector Store Unit Tests
 */

import { createStorage } from '../src/storage';
import {
  VectorStore,
  cosineSimilarity,
  searchSimilarVectors,
  UltraStreamCache,
  trimContextWindow,
} from '../src/ai';

describe('AI Edge-Cache Module', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage({ id: 'test-ai-storage' });
    storage.clear();
  });

  afterEach(() => {
    storage.clear();
  });

  describe('Scalar Fast-Path vs Complex Objects', () => {
    it('should handle scalar string fast-path correctly', () => {
      storage.set('str_key', 'hello world');
      expect(storage.get('str_key')).toBe('hello world');
    });

    it('should handle scalar number fast-path correctly', () => {
      storage.set('num_key', 42.5);
      expect(storage.get('num_key')).toBe(42.5);
    });

    it('should handle scalar boolean fast-path correctly', () => {
      storage.set('bool_key', true);
      expect(storage.get('bool_key')).toBe(true);
      storage.set('bool_key_false', false);
      expect(storage.get('bool_key_false')).toBe(false);
    });

    it('should handle complex JSON objects and arrays', () => {
      const obj = { id: 1, embedding: [0.1, 0.2, 0.3], meta: { tag: 'ai' } };
      storage.set('obj_key', obj);
      expect(storage.get('obj_key')).toEqual(obj);
    });
  });

  describe('Vector Store & Cosine Similarity', () => {
    it('should store and retrieve Float32Array vector embeddings', () => {
      const vecStore = new VectorStore(storage, 'test_vecs');
      const vec = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      vecStore.setVector('doc1', vec);

      const retrieved = vecStore.getVector('doc1');
      expect(retrieved).not.toBeNull();
      expect(Array.from(retrieved!)).toEqual(Array.from(vec));
    });

    it('should accurately calculate cosine similarity', () => {
      const vecA = new Float32Array([1.0, 0.0, 0.0]);
      const vecB = new Float32Array([1.0, 0.0, 0.0]);
      const vecC = new Float32Array([0.0, 1.0, 0.0]);

      expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
      expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
    });

    it('should perform top-K vector similarity search correctly', () => {
      const vecStore = new VectorStore(storage, 'embeddings');
      vecStore.setVector('doc_exact', new Float32Array([1, 0, 0]));
      vecStore.setVector('doc_similar', new Float32Array([0.9, 0.1, 0]));
      vecStore.setVector('doc_orthogonal', new Float32Array([0, 1, 0]));

      const query = new Float32Array([1, 0, 0]);
      const results = vecStore.searchSimilar(query, 2);

      expect(results).toHaveLength(2);
      expect(results[0].key).toBe('doc_exact');
      expect(results[0].score).toBeCloseTo(1.0);
      expect(results[1].key).toBe('doc_similar');
    });

    it('should support searchSimilarVectors standalone function', () => {
      const vecStore = new VectorStore(storage, 'vectors');
      vecStore.setVector('item1', new Float32Array([0.5, 0.5, 0.0]));
      const query = new Float32Array([0.5, 0.5, 0.0]);

      const results = searchSimilarVectors(query, 1, storage, 'vectors');
      expect(results).toHaveLength(1);
      expect(results[0].key).toBe('item1');
    });
  });

  describe('High-Frequency UltraStreamCache', () => {
    it('should accumulate tokens and flush stream to persistent storage', () => {
      const streamCache = new UltraStreamCache(storage);
      const streamId = 'ai_completion_123';

      streamCache.appendStreamToken(streamId, 'Hello');
      streamCache.appendStreamToken(streamId, ' ');
      streamCache.appendStreamToken(streamId, 'world');

      expect(streamCache.getStream(streamId)).toBe('Hello world');
      expect(streamCache.getStreamTokens(streamId)).toEqual(['Hello', ' ', 'world']);

      const flushedText = streamCache.flushStream(streamId);
      expect(flushedText).toBe('Hello world');
      expect(streamCache.getStream(streamId)).toBe('');
      expect(storage.get(streamId)).toBe('Hello world');
    });
  });

  describe('Context-Window LRU Eviction', () => {
    it('should trim message history while preserving system prompt', () => {
      const messages = [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: 'Msg 1' },
        { role: 'assistant', content: 'Reply 1' },
        { role: 'user', content: 'Msg 2' },
        { role: 'assistant', content: 'Reply 2' },
      ];

      const trimmed = trimContextWindow(messages, 3, { preserveSystemPrompt: true });
      expect(trimmed).toHaveLength(3);
      expect(trimmed[0].role).toBe('system');
      expect(trimmed[1].content).toBe('Msg 2');
      expect(trimmed[2].content).toBe('Reply 2');
    });
  });
});
