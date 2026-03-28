import { z } from 'zod';
import { emailSchema, phoneSchema, uuidSchema } from '../../common/validators';

export const createAdminSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: emailSchema,
    phone: phoneSchema,
    districtId: uuidSchema,
    entitlementMetadata: z.record(z.any()).optional(),
  }),
});

export const assignModuleAccessSchema = z.object({
  body: z.object({
    userId: uuidSchema,
    moduleName: z.string(),
    permissions: z.object({
      canCreate: z.boolean(),
      canRead: z.boolean(),
      canUpdate: z.boolean(),
      canDelete: z.boolean(),
    }),
  }),
});

export const updateAdminStatusSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    status: z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED']),
  }),
});