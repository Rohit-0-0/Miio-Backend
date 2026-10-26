/**
 * Central, code-level settings for the AI chatbot.
 * Kept in code on purpose (not env) so every change is reviewed and versioned.
 */
export const CHAT_CONFIG = {
  /** Anthropic model id. Start on Haiku; switch to 'claude-sonnet-5-5' if quality is not enough. */
  model: 'claude-haiku-5-5',

  /** Hard cap on tokens the model may write per reply. */
  maxOutputTokens: 1024,
  // Max model steps per reply (each tool call + the final answer counts as steps).
  maxToolSteps: 5,

  /** Messages accepted from the browser per request (older ones are dropped, not rejected). */
  maxMessagesAccepted: 40,

  /** Only the most recent messages are sent to the model. */
  maxMessagesKept: 12,

  /** Per-message text limits. */
  maxUserMessageChars: 2000,
  maxAssistantMessageChars: 8000,

  /** Total text across all accepted messages. Stops oversized histories inflating token cost. */
  maxTotalChars: 24000,

  /** Per-IP limits, applied per user message. */
  rateLimit: {
    perMinute: 10,
    perHour: 60,
  },
} as const;
