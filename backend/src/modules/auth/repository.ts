import prisma from '../../config/database';
import { User, UserRole } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: {
    fullName: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: UserRole;
    status?: string;
    isActive?: boolean;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}