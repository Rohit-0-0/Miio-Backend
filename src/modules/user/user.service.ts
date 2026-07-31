import { prisma } from '@/infrastructure/db/prisma';
import { AppError } from '@/shared/errors';
import { hashPassword, verifyPassword } from '@/shared/utils/security';
import { Role, Prisma } from '@prisma/client';
import type {
  ListUsersQuery,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UpdateProfileInput,
  UpdatePasswordInput,
} from './user.validation';

export class UserService {
  async getUsers(query: ListUsersQuery) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (query?.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { displayName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.role) {
      where.role = query.role;
    }

    if (query?.status) {
      where.isActive = query.status === 'active';
    }

    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async createUser(data: CreateUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        ...(data.displayName ? { displayName: data.displayName } : {}),
        role: data.role,
        isEmailVerified: true, // Assuming admins create verified users
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
      },
    });

    // TODO: Audit Log (Create User)

    return user;
  }

  async updateUser(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
      },
    });

    // TODO: Audit Log (Update User)

    return updated;
  }

  async updateUserRole(id: string, requestUserId: string, data: UpdateUserRoleInput) {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    if (id === requestUserId && targetUser.role === Role.ADMIN && data.role !== Role.ADMIN) {
      throw new AppError('Admins cannot remove their own ADMIN role.', 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: data.role },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
      },
    });

    // TODO: Audit Log (Change Role)

    return updated;
  }

  async updateUserStatus(id: string, requestUserId: string, data: UpdateUserStatusInput) {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    if (id === requestUserId && !data.isActive) {
      throw new AppError('Admins cannot disable their own account.', 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: data.isActive },
      select: {
        id: true,
        email: true,
        displayName: true,
        isActive: true,
      },
    });

    // TODO: Audit Log (Disable/Enable User)

    return updated;
  }

  async deleteUser(id: string, requestUserId: string) {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    if (id === requestUserId) {
      throw new AppError('Admins cannot delete their own account.', 403);
    }

    await prisma.user.delete({ where: { id } });

    // TODO: Audit Log (Delete User)

    return { success: true };
  }

  // Current User Operations
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    // TODO: Audit Log (Update Profile)

    return updated;
  }

  async updatePassword(userId: string, data: UpdatePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new AppError('User not found or no password set', 404);
    }

    const isValid = await verifyPassword(user.passwordHash, data.currentPassword);
    if (!isValid) {
      throw new AppError('Incorrect current password', 401);
    }

    const newPasswordHash = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // TODO: Audit Log (Change Password)

    return { success: true };
  }
}

export const userService = new UserService();
