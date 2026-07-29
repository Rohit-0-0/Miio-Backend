import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { env } from '@/shared/config/env';
import { ok } from '@/shared/utils/response';
import type { AuthRequest } from '@/shared/middleware/auth';

export class AuthController {
  private readonly service = new AuthService();

  async me(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await this.service.getMe(authReq.user.userId);
    return ok(res, user, 'User profile retrieved');
  }

  async register(req: Request, res: Response) {
    const result = await this.service.register(req.body);
    return ok(res, result, 'Registered successfully');
  }

  async login(req: Request, res: Response) {
    const result = await this.service.login(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ok(res, { accessToken: result.accessToken, user: result.user }, 'Logged in successfully');
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    await this.service.logout(refreshToken);
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return ok(res, null, 'Logged out successfully');
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const result = await this.service.refresh(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ok(res, { accessToken: result.accessToken }, 'Token refreshed');
  }

  async forgotPassword(req: Request, res: Response) {
    const result = await this.service.forgotPassword(req.body);
    return ok(res, result, 'Password reset requested');
  }

  async resetPassword(req: Request, res: Response) {
    const result = await this.service.resetPassword(req.body);
    return ok(res, result, 'Password reset successfully');
  }

  async verifyEmail(req: Request, res: Response) {
    const result = await this.service.verifyEmail(req.body);
    return ok(res, result, 'Email verified successfully');
  }
}
