import bcrypt from 'bcryptjs';
import { SuperAdminRepository } from './repository';
import { AuthRepository } from '../auth/repository';
import { CreateAdminRequest, AssignModuleAccessRequest } from './types';
import { UserRole } from '../../common/enums';
import { AppError } from '../../common/errors/AppError';

const superAdminRepo = new SuperAdminRepository();
const authRepo = new AuthRepository();

export class SuperAdminService {
  async createAdmin(data: CreateAdminRequest, superAdminId: string) {
    // Check if email exists
    const existingUser = await authRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create user
    const hashedPassword = await bcrypt.hash('defaultPassword123', 10); // TODO: generate proper password
    const user = await authRepo.createUser({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
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

  async updateAdminStatus(adminId: string, status: string) {
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