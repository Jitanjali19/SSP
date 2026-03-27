import { z } from 'zod';
import { phoneSchema, uuidSchema, dateSchema } from '../../common/validators';
import { Gender } from '@prisma/client';

export const registerPatientSchema = z.object({
  body: z.object({
    samagraId: z.string().optional(),
    abhaId: z.string().optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    gender: z.nativeEnum(Gender),
    dob: dateSchema,
    phone: phoneSchema,
    addressLine: z.string().min(1),
    village: z.string().min(1),
    city: z.string().min(1),
    districtId: uuidSchema,
    state: z.string().min(1),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  }),
});

export const getPatientByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const getPatientByQRSchema = z.object({
  params: z.object({
    qrCode: z.string(),
  }),
});