import bcrypt from 'bcryptjs';
import { RolePermission, User, UserRole, UserStatus } from '@prisma/client';
import { UserRepository } from './repository';
import { CreateUserRequest, UpdateUserRequest, UpdateStatusRequest } from './types';
import { AppError } from '../../common/errors/AppError';
import prisma from '../../config/database';

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserRequest): Promise<User> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('User already exists with this email', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return userRepository.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: hashedPassword,
      role: data.role,
      status: data.status || UserStatus.PENDING,
      isActive: data.isActive ?? true,
    });
  }

  async getAllUsers(page = 1, limit = 25): Promise<{ users: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      userRepository.findAll({ skip, take: limit }),
      userRepository.count(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { users, pagination: { page, limit, total, totalPages } };
  }

  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (data.email && data.email !== user.email) {
      const exist = await userRepository.findByEmail(data.email);
      if (exist && exist.id !== id) {
        throw new AppError('Email already taken', 409);
      }
    }

    return userRepository.update(id, {
      fullName: data.fullName ?? user.fullName,
      email: data.email ?? user.email,
      phone: data.phone ?? user.phone,
      role: data.role ?? user.role,
      status: data.status ?? user.status,
      isActive: data.isActive ?? user.isActive,
    });
  }

  async softDeleteUser(id: string): Promise<User> {
    await this.getUserById(id);
    return userRepository.softDelete(id);
  }

  async changeUserStatus(id: string, payload: UpdateStatusRequest): Promise<User> {
    await this.getUserById(id);
    return userRepository.update(id, {
      status: payload.status,
      isActive: payload.isActive ?? (payload.status === UserStatus.ACTIVE),
    });
  }

  async approveVendor(vendorId: string, adminId: string): Promise<any> {
    // Get vendor and user
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, include: { user: true } });
    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    const admin = await prisma.admin.findUnique({ where: { userId: adminId } });
    if (!admin) {
      throw new AppError('Only ADMIN can approve vendors', 403);
    }

    // Update vendor status to APPROVED
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: 'APPROVED',
        approvedByAdminId: admin.id,
        approvedAt: new Date(),
      },
      include: { user: true, approvedBy: true },
    });

    // Update user status to ACTIVE
    await userRepository.update(vendor.userId, {
      status: UserStatus.ACTIVE,
      isActive: true,
    });

    return updatedVendor;
  }

  async rejectVendor(vendorId: string, adminId: string, reason: string): Promise<any> {
    // Get vendor
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, include: { user: true } });
    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    const admin = await prisma.admin.findUnique({ where: { userId: adminId } });
    if (!admin) {
      throw new AppError('Only ADMIN can reject vendors', 403);
    }

    // Update vendor status to REJECTED
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: 'REJECTED',
        approvedByAdminId: admin.id,
        rejectionReason: reason,
      },
      include: { user: true, approvedBy: true },
    });

    // Update user status to REJECTED
    await userRepository.update(vendor.userId, {
      status: UserStatus.REJECTED,
      isActive: false,
    });

    return updatedVendor;
  }

  async getPendingVendors(): Promise<any[]> {
    return prisma.vendor.findMany({
      where: { status: 'PENDING' },
      include: { user: true, district: true },
    });
  }
}

