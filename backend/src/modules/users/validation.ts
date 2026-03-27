import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema, uuidSchema } from '../../common/validators';
import { UserRole, UserStatus } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    role: z.nativeEnum(UserRole),
    status: z.nativeEnum(UserStatus).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    fullName: z.string().min(2).optional(),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const changeStatusSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus),
    isActive: z.boolean().optional(),
  }),
});
