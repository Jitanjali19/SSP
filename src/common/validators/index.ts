import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email format');

export const phoneSchema = z.string().regex(/^\d{10}$/, 'Phone must be 10 digits');

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const dateSchema = z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format');