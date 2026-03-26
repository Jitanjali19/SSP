import { Request, Response } from 'express';
import { AuthService } from './service';
import { LoginRequest, RegisterRequest } from './types';
import { sendSuccess } from '../../common/utils';

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
}