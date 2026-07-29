import { prisma } from '@/infrastructure/db/prisma';
import type { 
  RegisterInput, 
  LoginInput, 
  ForgotPasswordInput, 
  ResetPasswordInput, 
  VerifyEmailInput 
} from './auth.validation';
import { AppError } from '@/shared/errors';
import { 
  hashPassword, 
  verifyPassword, 
  generateAccessToken, 
  generateRefreshToken 
} from '@/shared/utils/security';
import { emailService } from '@/infrastructure/email/klaviyo';
import crypto from 'crypto';

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
        isEmailVerified: process.env['NODE_ENV'] === 'development',
      },
    });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        token: verifyToken,
        userId: user.id,
        type: 'VERIFY_EMAIL',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email asynchronously
    emailService.sendVerificationEmail(user.email, verifyToken).catch(console.error);

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

    if (!user.isEmailVerified && process.env['NODE_ENV'] !== 'development') {
      throw new AppError('Please verify your email first', 403);
    }

    const isValid = await verifyPassword(user.passwordHash, data.password);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

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
        role: user.role,
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

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        type: 'RESET_PASSWORD',
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    emailService.sendPasswordResetEmail(user.email, resetToken).catch(console.error);

    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token: data.token },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.type !== 'RESET_PASSWORD' || tokenRecord.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await hashPassword(data.password);

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    await prisma.verificationToken.deleteMany({
      where: { userId: tokenRecord.userId, type: 'RESET_PASSWORD' },
    });

    return { message: 'Password has been reset successfully.' };
  }

  async verifyEmail(data: VerifyEmailInput) {
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token: data.token },
    });

    if (!tokenRecord || tokenRecord.type !== 'VERIFY_EMAIL' || tokenRecord.expiresAt < new Date()) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { isEmailVerified: true },
    });

    await prisma.verificationToken.deleteMany({
      where: { userId: tokenRecord.userId, type: 'VERIFY_EMAIL' },
    });

    return { message: 'Email successfully verified.' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}
