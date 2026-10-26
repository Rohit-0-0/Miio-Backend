import { z } from 'zod';

import { CHAT_CONFIG } from './chat.config';

/**
 * The browser sends the whole in-memory conversation each time (there is no server-side
 * chat history). Only plain text parts are accepted for now. Tool parts from the client
 * are deliberately rejected: later steps add tools, and client-supplied tool results
 * must never be trusted.
 */
const textPart = (maxChars: number) =>
  z.object({
    type: z.literal('text'),
    text: z.string().max(maxChars),
  });

// The chat UI library adds this marker to assistant messages; it carries no content.
const stepStartPart = z.object({ type: z.literal('step-start') });

// Once the bot uses tools, the browser sends those tool parts back with its own earlier
// replies. We accept them so the chat does not break, but they are DISCARDED server-side
// (only text is ever kept), so a client can never inject a fake tool result.
const toolPart = z.looseObject({ type: z.string().regex(/^(tool-.+|dynamic-tool)$/) });

/** Text of a message part, or '' for non-text parts (step markers, tool parts). */
export function getPartText(part: { type: string }): string {
  return part.type === 'text' && 'text' in part && typeof part.text === 'string' ? part.text : '';
}

const userMessage = z.object({
  id: z.string().min(1).max(128),
  role: z.literal('user'),
  parts: z.array(textPart(CHAT_CONFIG.maxUserMessageChars)).min(1).max(5),
});

const assistantMessage = z.object({
  id: z.string().min(1).max(128),
  role: z.literal('assistant'),
  parts: z
    .array(z.union([textPart(CHAT_CONFIG.maxAssistantMessageChars), stepStartPart, toolPart]))
    .min(1)
    .max(40),
});

const message = z.discriminatedUnion('role', [userMessage, assistantMessage]);

export const chatRequestSchema = z.object({
  body: z.object({
    messages: z
      .array(message)
      .min(1)
      .max(CHAT_CONFIG.maxMessagesAccepted)
      .refine(
        (messages) => {
          let total = 0;
          for (const m of messages) {
            for (const part of m.parts) total += getPartText(part).length;
          }
          return total <= CHAT_CONFIG.maxTotalChars;
        },
        { message: 'Conversation is too long. Please start a new chat.' },
      ),
  }),
  query: z.object({}),
  params: z.object({}),
});

export type ChatRequestBody = z.infer<typeof chatRequestSchema>['body'];
export type ChatMessageInput = ChatRequestBody['messages'][number];
