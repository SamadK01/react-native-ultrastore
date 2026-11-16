import { defaultStorage, StorageEngine } from '../storage';

interface StreamBuffer {
  chunks: string[];
  snapshot: string;
  dirty: boolean;
}

export class UltraStreamCache {
  private readonly storage: StorageEngine;
  private readonly activeStreams = new Map<string, StreamBuffer>();

  constructor(storage: StorageEngine = defaultStorage) {
    this.storage = storage;
  }

  appendStreamToken(streamId: string, token: string): void {
    if (streamId.length === 0 || token.length === 0) {
      return;
    }

    let stream = this.activeStreams.get(streamId);
    if (!stream) {
      stream = { chunks: [], snapshot: '', dirty: false };
      this.activeStreams.set(streamId, stream);
    }

    stream.chunks.push(token);
    stream.dirty = true;
  }

  getStream(streamId: string): string {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      return '';
    }

    // Token callbacks often cause several consumers to read the same stream.
    // Materialize once per append burst instead of allocating one joined string per read.
    if (stream.dirty) {
      stream.snapshot = stream.chunks.join('');
      stream.dirty = false;
    }
    return stream.snapshot;
  }

  getStreamTokens(streamId: string): string[] {
    const stream = this.activeStreams.get(streamId);
    // Do not expose the backing array: a consumer splice would corrupt the snapshot cache.
    return stream ? stream.chunks.slice() : [];
  }

  flushStream(streamId: string): string {
    const text = this.getStream(streamId);
    if (streamId.length === 0) {
      return text;
    }
    this.storage.set(streamId, text);
    this.activeStreams.delete(streamId);
    return text;
  }

  clearStream(streamId: string): void {
    this.activeStreams.delete(streamId);
  }
}

export const defaultStreamCache = new UltraStreamCache();
