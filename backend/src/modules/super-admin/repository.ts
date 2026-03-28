import prisma from '../../config/database';
import { Admin, User, RolePermission, UserStatus } from '@prisma/client';

export class SuperAdminRepository {
  async createAdmin(data: {
    userId: string;
    createdBySuperAdminId: string;
    districtId: string;
    entitlementMetadata?: any;
  }): Promise<Admin> {
    return prisma.admin.create({ data });
  }

  async findAdmins(): Promise<(Admin & { user: User })[]> {
    return prisma.admin.findMany({
      include: { user: true },
    });
  }

  async findAdminById(id: string): Promise<Admin | null> {
    return prisma.admin.findUnique({ where: { id } });
  }

  async updateAdminStatus(id: string, status: UserStatus): Promise<User> {
    return prisma.user.update({
      where: { id: (await this.findAdminById(id))?.userId },
      data: { status },
    });
  }

  async assignModuleAccess(data: {
    userId: string;
    moduleName: string;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }): Promise<RolePermission> {
    return prisma.rolePermission.upsert({
      where: {
        userId_moduleName: {
          userId: data.userId,
          moduleName: data.moduleName,
        },
      },
      update: {
        canCreate: data.canCreate,
        canRead: data.canRead,
        canUpdate: data.canUpdate,
        canDelete: data.canDelete,
      },
      create: data,
    });
  }
}