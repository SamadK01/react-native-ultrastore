/**
 * Context Window LRU Eviction Manager for Offline LLM Sessions
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | string;
  content: string;
  tokens?: number;
}

export interface TrimContextOptions {
  /** Keep initial system prompt pinned at top. Default: true */
  preserveSystemPrompt?: boolean;
}

/**
 * Trims message list to maintain sliding context window within limit
 */
export function trimContextWindow(
  messages: ChatMessage[],
  maxCount: number,
  options: TrimContextOptions = {}
): ChatMessage[] {
  const { preserveSystemPrompt = true } = options;

  if (messages.length <= maxCount) {
    return messages;
  }

  let systemPrompt: ChatMessage | undefined;
  let conversation = [...messages];

  if (
    preserveSystemPrompt &&
    conversation.length > 0 &&
    conversation[0].role === 'system'
  ) {
    systemPrompt = conversation[0];
    conversation = conversation.slice(1);
  }

  const limit = systemPrompt ? maxCount - 1 : maxCount;
  const trimmed = conversation.slice(conversation.length - limit);

  return systemPrompt ? [systemPrompt, ...trimmed] : trimmed;
}
