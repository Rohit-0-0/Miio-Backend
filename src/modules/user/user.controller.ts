import type { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import type { AuthRequest } from '@/shared/middleware/auth';
import {
  listUsersSchema,
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  updateProfileSchema,
  updatePasswordSchema,
} from './user.validation';

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listUsersSchema.shape.query.parse(req.query);
      const result = await userService.getUsers(query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUser(id as string);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.shape.body.parse(req.body);
      const user = await userService.createUser(data);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateUserSchema.shape.body.parse(req.body);
      const user = await userService.updateUser(id as string, data);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateUserRoleSchema.shape.body.parse(req.body);
      const requestUserId = req.user!.userId;
      const user = await userService.updateUserRole(id as string, requestUserId, data);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateUserStatusSchema.shape.body.parse(req.body);
      const requestUserId = req.user!.userId;
      const user = await userService.updateUserStatus(id as string, requestUserId, data);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestUserId = req.user!.userId;
      await userService.deleteUser(id as string, requestUserId);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await userService.getUser(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = updateProfileSchema.shape.body.parse(req.body);
      const user = await userService.updateProfile(userId, data);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = updatePasswordSchema.shape.body.parse(req.body);
      await userService.updatePassword(userId, data);
      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
