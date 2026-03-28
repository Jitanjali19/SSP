import bcrypt from 'bcryptjs';
import { SuperAdminRepository } from './repository';
import { AuthRepository } from '../auth/repository';
import { CreateAdminRequest, AssignModuleAccessRequest } from './types';
import { UserRole } from '../../common/enums';
import { AppError } from '../../common/errors/AppError';
import { ApprovalValidator } from '../../common/validators/approvalValidator';
import prisma from '../../config/database';

const superAdminRepo = new SuperAdminRepository();
const authRepo = new AuthRepository();

export class SuperAdminService {
  async createAdmin(data: CreateAdminRequest, superAdminId: string) {
    // Check if email exists
    const existingUser = await authRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create user with PENDING status - Admin must be approved by SUPER_ADMIN before becoming active
    const hashedPassword = await bcrypt.hash('defaultPassword123', 10); // TODO: generate proper password
    const user = await authRepo.createUser({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      status: 'PENDING',
      isActive: false,
    });

    // Create admin
    const admin = await superAdminRepo.createAdmin({
      userId: user.id,
      createdBySuperAdminId: superAdminId,
      districtId: data.districtId,
      entitlementMetadata: data.entitlementMetadata,
    });

    return { user, admin };
  }

  async listAdmins() {
    return superAdminRepo.findAdmins();
  }

  async updateAdminStatus(adminId: string, status: string, superAdminId?: string) {
    // Get the admin to find the user ID
    const admin = await superAdminRepo.findAdminById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    // Get the admin user to validate role
    const adminUser = await prisma.user.findUnique({ where: { id: admin.userId } });
    if (!adminUser) {
      throw new AppError('Admin user not found', 404);
    }

    // Validate that SUPER_ADMIN is approving
    const superAdminUser = superAdminId ? await prisma.user.findUnique({ where: { id: superAdminId } }) : null;
    if (superAdminUser?.role !== UserRole.SUPER_ADMIN) {
      throw new AppError('Only SUPER_ADMIN can change admin status', 403);
    }

    // Validate the status change
    ApprovalValidator.validateStatusChange(UserRole.SUPER_ADMIN, UserRole.ADMIN, status as any);

    return superAdminRepo.updateAdminStatus(adminId, status);
  }

  async assignModuleAccess(data: AssignModuleAccessRequest) {
    return superAdminRepo.assignModuleAccess({
      userId: data.userId,
      moduleName: data.moduleName,
      canCreate: data.permissions.canCreate,
      canRead: data.permissions.canRead,
      canUpdate: data.permissions.canUpdate,
      canDelete: data.permissions.canDelete,
    });
  }
}