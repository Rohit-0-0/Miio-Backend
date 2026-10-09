import { ApiKeySession, EventsApi, ProfilesApi } from 'klaviyo-api';
import { env } from '@/shared/config/env';

class KlaviyoEmailService {
  private eventsApi: EventsApi | null = null;
  private profilesApi: ProfilesApi | null = null;
  private readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = !!env.KLAVIYO_API_KEY;
    if (this.isConfigured) {
      const session = new ApiKeySession(env.KLAVIYO_API_KEY!);
      this.eventsApi = new EventsApi(session);
      this.profilesApi = new ProfilesApi(session);
    } else {
      console.warn('Klaviyo API Key not configured. Emails will not be sent.');
    }
  }

  private async trackEvent(metricName: string, email: string, properties: Record<string, any>, firstName?: string, lastName?: string) {
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
                  ...(firstName ? { first_name: firstName } : {}),
                  ...(lastName ? { last_name: lastName } : {}),
                  properties: {
                    ...(properties['source'] ? { $source: properties['source'] } : {})
                  }
                }
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
  async subscribeToNewsletter(email: string, listId: string, options?: { firstName?: string, lastName?: string, source?: string }) {
    if (!this.isConfigured) {
      console.log(`[Mock Email] Subscribe: ${email} to list ${listId}`);
      return { success: true };
    }
    if (options?.firstName || options?.lastName) {
      const profileData: any = {
        data: {
          type: 'profile',
          attributes: {
            email,
            first_name: options.firstName,
            last_name: options.lastName,
            properties: {
              ...(options.source ? { $source: options.source } : {})
            }
          }
        }
      };

      try {
        const createRes = await fetch('https://a.klaviyo.com/api/profiles/', {
          method: 'POST',
          headers: {
            'Authorization': `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
            'accept': 'application/json',
            'revision': '2024-02-15',
            'content-type': 'application/json'
          },
          body: JSON.stringify(profileData)
        });

        if (createRes.status === 409) {
          const errBody = (await createRes.json()) as any;
          const profileId = errBody.errors?.[0]?.meta?.duplicate_profile_id;
          
          if (profileId) {
            profileData.data.id = profileId;
            await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
                'accept': 'application/json',
                'revision': '2024-02-15',
                'content-type': 'application/json'
              },
              body: JSON.stringify(profileData)
            });
          }
        }
      } catch (e) {
        console.error('Failed to sync Klaviyo profile:', e);
      }
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
              custom_source: options?.source || "Newsletter Form",
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
        return { success: false, error: `Klaviyo error: ${errorText}` };
      }
      return { success: true };
    } catch (error: any) {
      console.error(`Failed to subscribe to Klaviyo list:`, error);
      return { success: false, error: error.message };
    }
  }
  async submitInteriorDesignEnquiry(formData: any) {
    if (!this.isConfigured) {
      console.log(`[Mock Email] Interior Design Enquiry from: ${formData.email}`, formData);
      return { success: true };
    }

    const firstName = formData.firstName || '';
    const lastName = formData.lastName || '';
    
    // Ensure phone number has a + for Klaviyo E.164 requirement
    let formattedPhone = (formData.phone || '').trim();
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    const profileData: any = {
      data: {
        type: 'profile',
        attributes: {
          email: formData.email,
          first_name: firstName,
          last_name: lastName,
          phone_number: formattedPhone,
          properties: {
            Lead_Source: 'Interior Design Enquiry',
            Property_Location: formData.propertyLocation,
            Property_Type: formData.propertyType,
            Property_Usage: formData.propertyUsage,
            Service_Required: Array.isArray(formData.services) ? formData.services.join(', ') : formData.services,
            Property_Size_Or_Bedrooms: formData.propertySize,
            Property_Stage: formData.propertyStage,
            Estimated_Budget: formData.budget,
            Ideal_Timeline: formData.timeline,
            Project_Details: formData.details,
            Hear_About_Us: formData.hearAboutUs,
            Floorplan_URL: formData.floorplanUrl
          }
        }
      }
    };

    try {
      // Create or update profile
      const createRes = await fetch('https://a.klaviyo.com/api/profiles/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
          'accept': 'application/json',
          'revision': '2024-02-15',
          'content-type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (createRes.status === 409) {
        const errBody = (await createRes.json()) as any;
        const profileId = errBody.errors?.[0]?.meta?.duplicate_profile_id;
        
        if (profileId) {
          profileData.data.id = profileId;
          await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
              'accept': 'application/json',
              'revision': '2024-02-15',
              'content-type': 'application/json'
            },
            body: JSON.stringify(profileData)
          });
        }
      }

      await this.trackEvent('Submitted Interior Design Enquiry', formData.email, profileData.data.attributes.properties);
      return { success: true };
    } catch (e: any) {
      console.error('Failed to submit interior design enquiry to Klaviyo:', e);
      return { success: false, error: e.message };
    }
  }
}

export const emailService = new KlaviyoEmailService();
