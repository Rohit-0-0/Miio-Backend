import { Resend } from 'resend';
import { env } from '@/shared/config/env';
import type { EmailProvider, SendEmailOptions, SendEmailResult } from '../types';

export class ResendProvider implements EmailProvider {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const response = await this.resend.emails.send({
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (response.error) {
        return {
          success: false,
          provider: 'resend',
          error: response.error.message,
        };
      }

      return {
        success: true,
        provider: 'resend',
        messageId: response.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'resend',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
