import { z } from 'zod';
import { Role } from '@prisma/client';

export const listUsersSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.enum(['active', 'disabled']).optional(),
  }),
});

export const createUserSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().optional(),
    role: z.nativeEnum(Role).default(Role.USER),
  }),
});

export const updateUserSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    displayName: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
});

export const updateUserRoleSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    role: z.nativeEnum(Role),
  }),
});

export const updateUserStatusSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const updateProfileSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    displayName: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
});

export const updatePasswordSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>['body'];
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>['body'];
