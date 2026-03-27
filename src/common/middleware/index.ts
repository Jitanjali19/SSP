import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { UserPayload } from '../types';
import { sendError } from '../utils';
import { AppError } from '../errors/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return sendError(res, 'Access token required', 'No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 'Invalid token', 'Token verification failed', 401);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 'User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return sendError(res, 'Insufficient permissions', 'Role not authorized', 403);
    }

    next();
  };
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.message, err.statusCode);
  }

  console.error(err);
  return sendError(res, 'Internal server error', 'Something went wrong', 500);
};