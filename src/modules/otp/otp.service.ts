import crypto from 'node:crypto';
import argon2 from 'argon2';
import { OTP_CONFIG } from './otp.config';
import { otpRepository } from './otp.repository';
import type { CreateOtpParams, CreateOtpResult, VerifyOtpParams } from './otp.types';
import { OtpError } from './otp.types';

export class OtpService {
  /**
   * Generates a new OTP, hashes it, and stores it in the database.
   * Deletes any existing OTP for the same email and purpose.
   */
  async createOtp({ email, purpose }: CreateOtpParams): Promise<CreateOtpResult> {
    const rawOtp = crypto
      .randomInt(OTP_CONFIG.MIN_VALUE, OTP_CONFIG.MAX_VALUE + 1)
      .toString();

    const otpHash = await argon2.hash(rawOtp);
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    await otpRepository.createOrReplaceOtp(email, purpose, otpHash, expiresAt);

    return {
      otp: rawOtp,
      expiresAt,
    };
  }

  /**
   * Verifies an OTP for a given email and purpose.
   * Enforces expiry, attempt limits, and single-use constraints.
   */
  async verifyOtp({ email, purpose, otp }: VerifyOtpParams): Promise<boolean> {
    const record = await otpRepository.findByEmailAndPurpose(email, purpose);

    if (!record) {
      throw new OtpError('OTP_NOT_FOUND', 'No OTP found for this request');
    }

    if (record.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      await otpRepository.deleteOtp(record.id);
      throw new OtpError('OTP_MAX_ATTEMPTS', 'Maximum verification attempts exceeded. Please request a new code.');
    }

    if (new Date() > record.expiresAt) {
      await otpRepository.deleteOtp(record.id);
      throw new OtpError('OTP_EXPIRED', 'OTP has expired. Please request a new code.');
    }

    const isValid = await argon2.verify(record.otpHash, otp);

    if (!isValid) {
      await otpRepository.incrementAttempts(record.id);
      throw new OtpError('OTP_INVALID', 'Invalid OTP provided');
    }

    // OTP verified successfully, it is single use so delete it.
    await otpRepository.deleteOtp(record.id);

    return true;
  }

  /**
   * Cleans up expired OTPs from the database.
   */
  async cleanupExpiredOtps(): Promise<number> {
    const result = await otpRepository.deleteExpiredOtps();
    return result.count;
  }
}

export const otpService = new OtpService();
