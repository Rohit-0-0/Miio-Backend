
import { prisma } from '@/infrastructure/db/prisma';
import type { OtpPurpose } from './otp.types';

export class OtpRepository {
  async createOrReplaceOtp(email: string, purpose: OtpPurpose, otpHash: string, expiresAt: Date) {
    // Delete any existing OTPs for the same email and purpose
    await prisma.emailOtp.deleteMany({
      where: {
        email,
        purpose,
      },
    });

    // Create the new OTP
    return prisma.emailOtp.create({
      data: {
        email,
        purpose,
        otpHash,
        expiresAt,
      },
    });
  }

  async findByEmailAndPurpose(email: string, purpose: OtpPurpose) {
    return prisma.emailOtp.findFirst({
      where: {
        email,
        purpose,
      },
    });
  }

  async incrementAttempts(id: string) {
    return prisma.emailOtp.update({
      where: { id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async deleteOtp(id: string) {
    return prisma.emailOtp.delete({
      where: { id },
    });
  }

  async deleteExpiredOtps() {
    return prisma.emailOtp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}

export const otpRepository = new OtpRepository();
