import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './repository';
import { LoginRequest, RegisterRequest, AuthResponse } from './types';
import { AppError } from '../../common/errors/AppError';
import { UserRole, UserStatus } from '@prisma/client';

const authRepo = new AuthRepository();

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const user = await authRepo.findUserByEmail(credentials.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // SUPER_ADMIN bypasses approval check - they are always allowed to login
    if (user.role !== UserRole.SUPER_ADMIN && user.status !== UserStatus.ACTIVE) {
      throw new AppError('Account is pending approval or not active', 403);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await authRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // SUPER_ADMIN is auto-approved and active immediately on registration
    // Other roles remain PENDING and require approval
    const statusForRole = data.role === UserRole.SUPER_ADMIN ? UserStatus.ACTIVE : UserStatus.PENDING;
    const isActiveForRole = data.role === UserRole.SUPER_ADMIN;

    const user = await authRepo.createUser({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: hashedPassword,
      role: data.role,
      status: statusForRole,
      isActive: isActiveForRole,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async me(userId: string) {
    const user = await authRepo.findUserById(userId);
    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async logout() {
    // For stateless JWT, logout is handled client-side via token deletion.
    return {
      message: 'Logged out successfully',
    };
  }

  async changePassword(userId: string, payload: { currentPassword: string; newPassword: string }) {
    const user = await authRepo.findUserById(userId);
    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Current password is invalid', 400);
    }

    const hashedNewPassword = await bcrypt.hash(payload.newPassword, 10);
    await authRepo.updateUser(userId, { passwordHash: hashedNewPassword });

    return { message: 'Password changed successfully' };
  }
}