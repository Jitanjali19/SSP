import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema } from '../../common/validators';
import { UserRole } from '@prisma/client';

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    role: z.nativeEnum(UserRole),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  }),
});