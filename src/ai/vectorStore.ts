/**
 * Vector Embeddings Storage & Fast Cosine Similarity Search
 * High-performance TypedArray math for on-device RAG / LLM Embeddings
 */

import { defaultStorage, StorageEngine } from '../storage';

export function float32ArrayToBase64(array: Float32Array): string {
  const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  return binary;
}

export function base64ToFloat32Array(base64: string): Float32Array {
  let binary: string;
  if (typeof atob === 'function') {
    binary = atob(base64);
  } else if (typeof Buffer !== 'undefined') {
    binary = Buffer.from(base64, 'base64').toString('binary');
  } else {
    binary = base64;
  }
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}

/**
 * High-performance Cosine Similarity calculation between two Float32Array vectors
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const valA = a[i];
    const valB = b[i];
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface VectorSearchResult {
  key: string;
  score: number;
  vector: Float32Array;
}

export class VectorStore {
  private storage: StorageEngine;
  private prefix: string;

  constructor(storage: StorageEngine = defaultStorage, namespace: string = 'vectors') {
    this.storage = storage;
    this.prefix = `__vec_${namespace}__`;
  }

  setVector(key: string, vector: Float32Array): void {
    const fullKey = `${this.prefix}${key}`;
    const base64 = float32ArrayToBase64(vector);
    this.storage.set(fullKey, `v:${base64}`);
  }

  getVector(key: string): Float32Array | null {
    const fullKey = `${this.prefix}${key}`;
    const raw = this.storage.get<string>(fullKey);
    if (!raw) return null;
    const base64 = raw.startsWith('v:') ? raw.slice(2) : raw;
    return base64ToFloat32Array(base64);
  }

  searchSimilar(queryVector: Float32Array, topK: number = 5): VectorSearchResult[] {
    const keys = this.storage.getAllKeys().filter((k) => k.startsWith(this.prefix));
    const results: VectorSearchResult[] = [];

    for (const fullKey of keys) {
      const key = fullKey.slice(this.prefix.length);
      const vec = this.getVector(key);
      if (vec) {
        const score = cosineSimilarity(queryVector, vec);
        results.push({ key, score, vector: vec });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }
}

/**
 * Standalone search helper for vector collections
 */
export function searchSimilarVectors(
  queryVector: Float32Array,
  topK: number = 5,
  storage: StorageEngine = defaultStorage,
  namespace: string = 'vectors'
): VectorSearchResult[] {
  const store = new VectorStore(storage, namespace);
  return store.searchSimilar(queryVector, topK);
}
