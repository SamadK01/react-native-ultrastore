/**
 * Portable vector persistence and in-memory search utilities for edge RAG.
 */

import { defaultStorage, StorageEngine } from '../storage';

const isValidVector = (value: unknown): value is Float32Array => {
  if (!(value instanceof Float32Array) || value.length === 0) {
    return false;
  }

  for (let index = 0; index < value.length; index += 1) {
    if (!Number.isFinite(value[index])) {
      return false;
    }
  }

  return true;
};

const isValidKey = (key: string): boolean => key.length > 0;

const toBinary = (bytes: Uint8Array): string => {
  let binary = '';
  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return binary;
};

/** Convert a finite Float32Array to a portable Base64 representation. */
export function float32ArrayToBase64(array: Float32Array): string {
  if (!isValidVector(array)) {
    return '';
  }

  try {
    const bytes = new Uint8Array(
      array.buffer,
      array.byteOffset,
      array.byteLength
    );
    const binary = toBinary(bytes);

    if (typeof btoa === 'function') {
      return btoa(binary);
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }

    return binary;
  } catch {
    return '';
  }
}

/** Decode a Base64 vector. Invalid input returns an empty typed array. */
export function base64ToFloat32Array(base64: string): Float32Array {
  if (typeof base64 !== 'string' || base64.length === 0) {
    return new Float32Array();
  }

  try {
    let binary: string;
    if (typeof atob === 'function') {
      binary = atob(base64);
    } else if (typeof Buffer !== 'undefined') {
      binary = Buffer.from(base64, 'base64').toString('binary');
    } else {
      binary = base64;
    }

    if (
      binary.length === 0 ||
      binary.length % Float32Array.BYTES_PER_ELEMENT !== 0
    ) {
      return new Float32Array();
    }

    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Float32Array(bytes.buffer);
  } catch {
    return new Float32Array();
  }
}

/** Return cosine similarity in [-1, 1], or 0 for invalid vectors. */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (!isValidVector(a) || !isValidVector(b) || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    const valueA = a[index];
    const valueB = b[index];
    dotProduct += valueA * valueB;
    normA += valueA * valueA;
    normB += valueB * valueB;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / Math.sqrt(normA * normB);
}

/** Return Euclidean distance, or Infinity for invalid or mismatched vectors. */
export function euclideanDistance(a: Float32Array, b: Float32Array): number {
  if (!isValidVector(a) || !isValidVector(b) || a.length !== b.length) {
    return Infinity;
  }

  let squaredDistance = 0;
  for (let index = 0; index < a.length; index += 1) {
    const difference = a[index] - b[index];
    squaredDistance += difference * difference;
  }

  return Math.sqrt(squaredDistance);
}

export interface VectorSearchResult {
  key: string;
  score: number;
  vector: Float32Array;
}

export interface VectorDistanceResult {
  key: string;
  distance: number;
  vector: Float32Array;
}

/**
 * Persistent vector collection with a bounded in-memory decode cache.
 */
export class VectorStore {
  private readonly storage: StorageEngine;
  private readonly prefix: string;
  private readonly vectorCache = new Map<string, Float32Array>();

  constructor(
    storage: StorageEngine = defaultStorage,
    namespace: string = 'vectors'
  ) {
    this.storage = storage;
    this.prefix = `__vec_${namespace || 'vectors'}__`;
  }

  /** Persist a finite, non-empty Float32Array. Invalid values are ignored. */
  setVector(key: string, vector: Float32Array): void {
    if (!isValidKey(key) || !isValidVector(vector)) {
      return;
    }

    const base64 = float32ArrayToBase64(vector);
    if (!base64) {
      return;
    }

    try {
      const cachedVector = new Float32Array(vector);
      this.storage.set(`${this.prefix}${key}`, `v:${base64}`);
      this.vectorCache.set(key, cachedVector);
    } catch {
      // Storage fallbacks must not interrupt an AI response or render path.
    }
  }

  /** Read a vector copy. Mutating the returned value never changes the cache. */
  getVector(key: string): Float32Array | null {
    if (!isValidKey(key)) {
      return null;
    }

    const vector = this.getCachedVector(key);
    return vector ? new Float32Array(vector) : null;
  }

  /** Remove one vector from persistence and the in-memory cache. */
  deleteVector(key: string): void {
    if (!isValidKey(key)) {
      return;
    }

    this.vectorCache.delete(key);
    try {
      this.storage.delete(`${this.prefix}${key}`);
    } catch {
      // Ignore unavailable storage backends; the memory cache is already clear.
    }
  }

  /** Release decoded vectors without removing their persisted embeddings. */
  clearCache(): void {
    this.vectorCache.clear();
  }

  /** Search by descending cosine similarity. */
  searchSimilar(
    queryVector: Float32Array,
    topK: number = 5
  ): VectorSearchResult[] {
    if (!isValidVector(queryVector)) {
      return [];
    }

    const limit = normalizeTopK(topK);
    if (limit === 0) {
      return [];
    }

    const results: VectorSearchResult[] = [];
    for (const key of this.getStoredVectorKeys()) {
      const vector = this.getCachedVector(key);
      if (!vector || vector.length !== queryVector.length) {
        continue;
      }
      insertByScore(
        results,
        { key, score: cosineSimilarity(queryVector, vector), vector },
        limit
      );
    }

    return results.map(({ key, score, vector }) => ({
      key,
      score,
      vector: new Float32Array(vector),
    }));
  }

  /** Search by ascending Euclidean distance. */
  searchNearest(
    queryVector: Float32Array,
    topK: number = 5
  ): VectorDistanceResult[] {
    if (!isValidVector(queryVector)) {
      return [];
    }

    const limit = normalizeTopK(topK);
    if (limit === 0) {
      return [];
    }

    const results: VectorDistanceResult[] = [];
    for (const key of this.getStoredVectorKeys()) {
      const vector = this.getCachedVector(key);
      if (!vector || vector.length !== queryVector.length) {
        continue;
      }
      insertByDistance(
        results,
        { key, distance: euclideanDistance(queryVector, vector), vector },
        limit
      );
    }

    return results.map(({ key, distance, vector }) => ({
      key,
      distance,
      vector: new Float32Array(vector),
    }));
  }

  private getStoredVectorKeys(): string[] {
    try {
      return this.storage
        .getAllKeys()
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.slice(this.prefix.length));
    } catch {
      return [];
    }
  }

  private getCachedVector(key: string): Float32Array | null {
    const cachedVector = this.vectorCache.get(key);
    if (cachedVector) {
      return cachedVector;
    }

    try {
      const raw = this.storage.get<string>(`${this.prefix}${key}`);
      if (typeof raw !== 'string' || raw.length === 0) {
        return null;
      }

      const vector = base64ToFloat32Array(
        raw.startsWith('v:') ? raw.slice(2) : raw
      );
      if (!isValidVector(vector)) {
        return null;
      }

      this.vectorCache.set(key, vector);
      return vector;
    } catch {
      return null;
    }
  }
}

const normalizeTopK = (topK: number): number => {
  if (!Number.isFinite(topK)) {
    return 0;
  }
  return Math.max(0, Math.floor(topK));
};

const insertByScore = (
  results: VectorSearchResult[],
  result: VectorSearchResult,
  limit: number
): void => {
  let index = results.length;
  while (index > 0 && results[index - 1].score < result.score) {
    index -= 1;
  }
  results.splice(index, 0, result);
  if (results.length > limit) {
    results.pop();
  }
};

const insertByDistance = (
  results: VectorDistanceResult[],
  result: VectorDistanceResult,
  limit: number
): void => {
  let index = results.length;
  while (index > 0 && results[index - 1].distance > result.distance) {
    index -= 1;
  }
  results.splice(index, 0, result);
  if (results.length > limit) {
    results.pop();
  }
};

/** Standalone cosine search helper for a vector collection. */
export function searchSimilarVectors(
  queryVector: Float32Array,
  topK: number = 5,
  storage: StorageEngine = defaultStorage,
  namespace: string = 'vectors'
): VectorSearchResult[] {
  return new VectorStore(storage, namespace).searchSimilar(queryVector, topK);
}
