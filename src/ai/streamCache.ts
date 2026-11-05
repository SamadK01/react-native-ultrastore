/**
 * High-Frequency Streaming Token Cache (UltraStreamCache)
 * Allows realtime AI token accumulation without full document re-serialization
 */

import { defaultStorage, StorageEngine } from '../storage';

export class UltraStreamCache {
  private storage: StorageEngine;
  private activeStreams: Map<string, string[]> = new Map();

  constructor(storage: StorageEngine = defaultStorage) {
    this.storage = storage;
  }

  /**
   * Append a single token to an active stream
   */
  appendStreamToken(streamId: string, token: string): void {
    if (!this.activeStreams.has(streamId)) {
      this.activeStreams.set(streamId, []);
    }
    this.activeStreams.get(streamId)!.push(token);
  }

  /**
   * Get accumulated text string for an active stream
   */
  getStream(streamId: string): string {
    const tokens = this.activeStreams.get(streamId);
    if (!tokens) {
      return '';
    }
    return tokens.join('');
  }

  /**
   * Get raw token array for an active stream
   */
  getStreamTokens(streamId: string): string[] {
    return this.activeStreams.get(streamId) || [];
  }

  /**
   * Flush stream to persistent storage engine and clear active buffer
   */
  flushStream(streamId: string): string {
    const text = this.getStream(streamId);
    this.storage.set(streamId, text);
    this.activeStreams.delete(streamId);
    return text;
  }

  /**
   * Clear stream buffer without saving
   */
  clearStream(streamId: string): void {
    this.activeStreams.delete(streamId);
  }
}

export const defaultStreamCache = new UltraStreamCache();
