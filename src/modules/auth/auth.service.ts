import { prisma } from '@/infrastructure/db/prisma';
import type { 
  RegisterInput, 
  LoginInput, 
  ForgotPasswordInput, 
  ResetPasswordInput, 
  VerifyEmailInput,
  ResendVerificationOtpInput
} from './auth.validation';
import { AppError } from '@/shared/errors';
import { 
  hashPassword, 
  verifyPassword, 
  generateAccessToken, 
  generateRefreshToken 
} from '@/shared/utils/security';
import { emailService } from '@/services/email';
import { otpService, OTP_CONFIG } from '@/modules/otp';

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        displayName: data.displayName,
        isEmailVerified: false,
      },
    });

    const { otp } = await otpService.createOtp({
      email: user.email,
      purpose: 'VERIFY_EMAIL',
    });

    // Send verification email asynchronously
    emailService.sendVerificationEmail(user.email, { 
      name: user.displayName || user.email.split('@')[0] || 'User', 
      otp, 
      expiryMinutes: OTP_CONFIG.EXPIRY_MINUTES 
    }).catch(console.error);

    return {
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email first', 403, 'EMAIL_NOT_VERIFIED');
    }

    const isValid = await verifyPassword(user.passwordHash, data.password);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 403);
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: new Date(),
      },
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async refresh(oldRefreshToken: string) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      }
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const { user } = tokenRecord;
    
    // Revoke old token
    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    // Generate new tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Do not reveal that the user does not exist
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    const { otp } = await otpService.createOtp({
      email: user.email,
      purpose: 'PASSWORD_RESET',
    });

    emailService.sendForgotPasswordEmail(user.email, { 
      name: user.displayName || user.email.split('@')[0] || 'User', 
      otp, 
      expiryMinutes: OTP_CONFIG.EXPIRY_MINUTES 
    }).catch(console.error);

    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Avoid revealing user existence
      throw new AppError('Invalid or expired reset token', 400);
    }

    await otpService.verifyOtp({
      email: data.email,
      purpose: 'PASSWORD_RESET',
      otp: data.otp,
    });

    const passwordHash = await hashPassword(data.password);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password has been reset successfully.' };
  }

  async verifyEmail(data: VerifyEmailInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    await otpService.verifyOtp({
      email: data.email,
      purpose: 'VERIFY_EMAIL',
      otp: data.otp,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    return { message: 'Email successfully verified.' };
  }

  async resendVerificationOtp(data: ResendVerificationOtpInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    const { otp } = await otpService.createOtp({
      email: user.email,
      purpose: 'VERIFY_EMAIL',
    });

    emailService.sendVerificationEmail(user.email, { 
      name: user.displayName || user.email.split('@')[0] || 'User', 
      otp, 
      expiryMinutes: OTP_CONFIG.EXPIRY_MINUTES 
    }).catch(console.error);

    return { message: 'Verification OTP sent successfully.' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}
