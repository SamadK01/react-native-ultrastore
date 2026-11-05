/**
 * react-native-ultrastore/ai
 * AI Edge-Cache and State Engine Sub-path
 */

export {
  VectorStore,
  searchSimilarVectors,
  cosineSimilarity,
  euclideanDistance,
  float32ArrayToBase64,
  base64ToFloat32Array,
} from './vectorStore';
export type { VectorSearchResult, VectorDistanceResult } from './vectorStore';

export { UltraStreamCache, defaultStreamCache } from './streamCache';

export { trimContextWindow } from './contextWindow';
export type { ChatMessage, TrimContextOptions } from './contextWindow';
