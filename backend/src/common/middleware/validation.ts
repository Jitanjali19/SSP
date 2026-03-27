import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/AppError';

interface ValidationErrorItem {
  field: string;
  message: string;
}

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req);
      next();
    } catch (error: any) {
      const validationErrors: ValidationErrorItem[] = error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError(`Validation failed: ${validationErrors.map((e: ValidationErrorItem) => e.message).join(', ')}`);
    }
  };
};