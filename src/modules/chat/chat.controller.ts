import type { Request, Response } from 'express';
import { pipeUIMessageStreamToResponse } from 'ai';

import { logger } from '@/shared/logger';

import { createChatStream } from './chat.service';
import type { ChatRequestBody } from './chat.validation';

export async function streamChat(req: Request, res: Response): Promise<void> {
  const { messages } = req.body as ChatRequestBody;

  // Stop paying for tokens if the guest closes the tab mid-reply.
  const abortController = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) abortController.abort();
  });

  const stream = await createChatStream(messages, abortController.signal);

  try {
    await pipeUIMessageStreamToResponse({ response: res, stream });
  } catch (error) {
    // Once streaming has started the status line is already sent, so the normal JSON
    // error handler can't be used. Log it and close the connection.
    if (res.headersSent) {
      logger.error(error, '[chat] failed while streaming');
      res.end();
      return;
    }
    throw error;
  }
}
