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
  async subscribeToNewsletter(email: string, listId: string) {
    if (!this.isConfigured) {
      console.log(`[Mock Email] Subscribe: ${email} to list ${listId}`);
      return { success: true };
    }
    
    try {
      const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
          'accept': 'application/json',
          'revision': '2024-02-15',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              custom_source: "Newsletter Form",
              profiles: {
                data: [
                  {
                    type: "profile",
                    attributes: {
                      email: email,
                      subscriptions: {
                        email: {
                          marketing: { consent: "SUBSCRIBED" }
                        }
                      }
                    }
                  }
                ]
              }
            },
            relationships: {
              list: {
                data: {
                  type: "list",
                  id: listId
                }
              }
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Klaviyo subscription failed: ${response.status} ${errorText}`);
        return { success: false, error: 'Failed to subscribe' };
      }
      return { success: true };
    } catch (error: any) {
      console.error(`Failed to subscribe to Klaviyo list:`, error);
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new KlaviyoEmailService();
