import { Request, Response } from 'express';
import { AuthService } from './service';
import { LoginRequest, RegisterRequest } from './types';
import { sendSuccess } from '../../common/utils';
import { AppError } from '../../common/errors/AppError';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const credentials: LoginRequest = req.body;
    const result = await authService.login(credentials);
    sendSuccess(res, 'Login successful', result);
  }

  async register(req: Request, res: Response) {
    const data: RegisterRequest = req.body;
    const result = await authService.register(data);
    sendSuccess(res, 'Registration successful', result, 201);
  }

  async me(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    const result = await authService.me(userId);
    sendSuccess(res, 'Current user fetched successfully', result);
  }

  async logout(req: Request, res: Response) {
    const result = await authService.logout();
    sendSuccess(res, 'Logout successful', result);
  }

  async changePassword(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    const payload = req.body;
    const result = await authService.changePassword(userId, payload);
    sendSuccess(res, 'Password changed successfully', result);
  }
}