import { ApiKeySession, EventsApi } from 'klaviyo-api';
import { env } from '@/shared/config/env';

class KlaviyoEmailService {
  private eventsApi: EventsApi | null = null;
  private readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = !!env.KLAVIYO_API_KEY;
    if (this.isConfigured) {
      const session = new ApiKeySession(env.KLAVIYO_API_KEY!);
      this.eventsApi = new EventsApi(session);
    } else {
      console.warn('Klaviyo API Key not configured. Emails will not be sent.');
    }
  }

  private async trackEvent(metricName: string, email: string, properties: Record<string, any>) {
    if (!this.isConfigured || !this.eventsApi) {
      console.log(`[Mock Email] Event: ${metricName} | To: ${email} | Data:`, properties);
      return;
    }

    try {
      await this.eventsApi.createEvent({
        data: {
          type: 'event',
          attributes: {
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email,
                },
              }
            },
            metric: {
              data: {
                type: 'metric',
                attributes: {
                  name: metricName,
                }
              }
            },
            properties,
          }
        }
      });
    } catch (error) {
      console.error(`Failed to send Klaviyo event ${metricName}:`, error);
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    await this.trackEvent('Triggered Email Verification', email, {
      verification_url: verificationUrl,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await this.trackEvent('Triggered Password Reset', email, {
      reset_url: resetUrl,
    });
  }
}

export const emailService = new KlaviyoEmailService();
