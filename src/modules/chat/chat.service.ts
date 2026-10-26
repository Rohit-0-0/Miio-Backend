import { createAnthropic } from '@ai-sdk/anthropic';
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';

import { env } from '@/shared/config/env';
import { HTTP_STATUS } from '@/shared/constants';
import { AppError } from '@/shared/errors';
import { logger } from '@/shared/logger';

import { CHAT_CONFIG } from './chat.config';
import { getPropertyFacts } from './chat.knowledge';
import { buildInstructions } from './chat.prompt';
import { chatTools } from './chat.tools';
import { getPartText, type ChatMessageInput } from './chat.validation';

const GENERIC_STREAM_ERROR = 'Sorry, something went wrong. Please try again.';

let anthropicProvider: ReturnType<typeof createAnthropic> | null = null;

function getModel() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new AppError(
      'The chat assistant is not available right now.',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      'SERVICE_UNAVAILABLE',
    );
  }
  anthropicProvider ??= createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return anthropicProvider(CHAT_CONFIG.model);
}

/**
 * Keeps only the most recent messages and only their text, and guarantees the
 * conversation starts and ends with a user message (what the model API expects).
 */
export function prepareMessages(messages: ChatMessageInput[]): UIMessage[] {
  const cleaned: UIMessage[] = [];

  for (const m of messages.slice(-CHAT_CONFIG.maxMessagesKept)) {
    const text = m.parts.map(getPartText).join('').trim();
    if (!text) continue;
    cleaned.push({ id: m.id, role: m.role, parts: [{ type: 'text', text }] });
  }

  while (cleaned[0]?.role === 'assistant') cleaned.shift();

  if (cleaned.at(-1)?.role !== 'user') {
    throw new AppError(
      'The last message must be from the user.',
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR',
    );
  }

  return cleaned;
}

/** Streams the assistant's reply as a UI message stream. */
export async function createChatStream(messages: ChatMessageInput[], abortSignal: AbortSignal) {
  const uiMessages = prepareMessages(messages);
  const model = getModel();
  const facts = await getPropertyFacts();

  const result = streamText({
    model,
    instructions: buildInstructions(facts),
    messages: await convertToModelMessages(uiMessages),
    tools: chatTools,
    // Lets the model call a tool, read the result, then answer (and chain up to a few calls).
    stopWhen: isStepCount(CHAT_CONFIG.maxToolSteps),
    maxOutputTokens: CHAT_CONFIG.maxOutputTokens,
    abortSignal,
    onEnd: (event) => {
      logger.info({ usage: event.usage }, '[chat] reply completed');
    },
  });

  return toUIMessageStream({
    stream: result.stream,
    onError: (error) => {
      // Never forward provider error details (they can contain request data) to the browser.
      logger.error(error, '[chat] stream error');
      return GENERIC_STREAM_ERROR;
    },
  });
}
