import { logger } from '@/shared/logger';
import type { EmailProvider, ForgotPasswordPayload, SendEmailResult, VerifyEmailPayload, WelcomePayload } from './types';
import { ResendProvider } from './providers/resend.provider';
import { verifyEmailTemplate } from './templates/verify-email';
import { forgotPasswordTemplate } from './templates/forgot-password';
import { welcomeTemplate } from './templates/welcome';

export class EmailService {
  constructor(private readonly provider: EmailProvider) {}

  private async send(to: string | string[], subject: string, html: string, templateName: string): Promise<SendEmailResult> {
    const startTime = Date.now();
    try {
      const result = await this.provider.send({ to, subject, html });
      const duration = Date.now() - startTime;
      
      if (result.success) {
        logger.info({
          msg: 'Email sent successfully',
          recipient: to,
          template: templateName,
          provider: result.provider,
          duration,
          messageId: result.messageId,
        });
      } else {
        logger.error({
          msg: 'Email provider failed to send email',
          recipient: to,
          template: templateName,
          provider: result.provider,
          duration,
          error: result.error, // Safe to log internally, not exposed to API consumer
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({
        msg: 'Unexpected error sending email',
        recipient: to,
        template: templateName,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        success: false,
        provider: 'unknown',
        error: 'An unexpected error occurred',
      };
    }
  }

  async sendVerificationEmail(to: string, payload: VerifyEmailPayload): Promise<SendEmailResult> {
    const html = verifyEmailTemplate(payload);
    return this.send(to, 'Verify your email address', html, 'verify-email');
  }

  async sendForgotPasswordEmail(to: string, payload: ForgotPasswordPayload): Promise<SendEmailResult> {
    const html = forgotPasswordTemplate(payload);
    return this.send(to, 'Reset your password', html, 'forgot-password');
  }

  async sendWelcomeEmail(to: string, payload: WelcomePayload): Promise<SendEmailResult> {
    const html = welcomeTemplate(payload);
    return this.send(to, 'Welcome to Miio!', html, 'welcome');
  }
}

// Instantiate with Resend Provider as default
export const emailService = new EmailService(new ResendProvider());
