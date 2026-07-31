import type { OtpPurpose } from '@prisma/client';

export type { OtpPurpose };

export interface CreateOtpParams {
  email: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpParams {
  email: string;
  purpose: OtpPurpose;
  otp: string;
}

export interface CreateOtpResult {
  otp: string;
  expiresAt: Date;
}

export class OtpError extends Error {
  constructor(public code: 'OTP_EXPIRED' | 'OTP_NOT_FOUND' | 'OTP_INVALID' | 'OTP_MAX_ATTEMPTS', message: string) {
    super(message);
    this.name = 'OtpError';
  }
}
