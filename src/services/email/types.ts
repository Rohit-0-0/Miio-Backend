export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  provider: 'resend' | string;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<SendEmailResult>;
}

export interface VerifyEmailPayload {
  name: string;
  otp: string;
  expiryMinutes: number;
}

export interface ForgotPasswordPayload {
  name: string;
  otp: string;
  expiryMinutes: number;
}

export interface WelcomePayload {
  name: string;
}
