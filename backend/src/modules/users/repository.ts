import prisma from '../../config/database';
import { User, UserStatus } from '@prisma/client';

export class UserRepository {
  async create(data: {
    fullName: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: User['role'];
    status?: UserStatus;
    isActive?: boolean;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findAll(options?: { skip?: number; take?: number; where?: Record<string, any> }): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        ...options?.where,
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(options?: { where?: Record<string, any> }): Promise<number> {
    return prisma.user.count({
      where: {
        deletedAt: null,
        ...options?.where,
      },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
