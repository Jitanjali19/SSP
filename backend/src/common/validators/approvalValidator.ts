import { UserRole, UserStatus } from '@prisma/client';
import { AppError } from '../errors/AppError';

export class ApprovalValidator {
  /**
   * Validates if the current user can approve a target user based on roles
   * Following the hierarchy:
   * - SUPER_ADMIN can approve ADMIN
   * - ADMIN can approve VENDOR and PATIENT
   * - VENDOR cannot approve anyone
   * - PATIENT cannot approve anyone
   */
  static canApproveUser(approverRole: UserRole, targetRole: UserRole): boolean {
    if (approverRole === UserRole.SUPER_ADMIN) {
      // Super Admin can only approve ADMIN
      return targetRole === UserRole.ADMIN;
    }

    if (approverRole === UserRole.ADMIN) {
      // Admin can approve VENDOR and PATIENT (through their respective services)
      // But not ADMIN or SUPER_ADMIN
      return targetRole === UserRole.VENDOR || targetRole === UserRole.PATIENT;
    }

    // VENDOR, DOCTOR, FIELD_STAFF, LABOR, PATIENT cannot approve anyone
    return false;
  }

  /**
   * Validates if the current user can change the status of a target user
   */
  static canChangeUserStatus(approverRole: UserRole, targetRole: UserRole, newStatus: UserStatus): boolean {
    // Check if approver has permission to approve this role
    if (!this.canApproveUser(approverRole, targetRole)) {
      return false;
    }

    // Validate status transitions
    const validTransitions: Record<UserRole, UserStatus[]> = {
      [UserRole.ADMIN]: [UserStatus.ACTIVE, UserStatus.REJECTED, UserStatus.SUSPENDED],
      [UserRole.VENDOR]: [UserStatus.ACTIVE, UserStatus.REJECTED, UserStatus.SUSPENDED],
      [UserRole.PATIENT]: [UserStatus.ACTIVE, UserStatus.REJECTED, UserStatus.SUSPENDED],
      [UserRole.DOCTOR]: [UserStatus.ACTIVE, UserStatus.SUSPENDED],
      [UserRole.FIELD_STAFF]: [UserStatus.ACTIVE, UserStatus.SUSPENDED],
      [UserRole.LABOR]: [UserStatus.ACTIVE, UserStatus.SUSPENDED],
      [UserRole.SUPER_ADMIN]: [], // SUPER_ADMIN cannot be changed by anyone
    };

    return validTransitions[targetRole]?.includes(newStatus) || false;
  }

  /**
   * Throws error if approval is invalid
   */
  static validateApproval(approverRole: UserRole | undefined, targetRole: UserRole, action: string = 'approve'): void {
    if (!approverRole) {
      throw new AppError('Unauthorized: User role not found', 401);
    }

    if (!this.canApproveUser(approverRole, targetRole)) {
      throw new AppError(
        `${approverRole} cannot ${action} ${targetRole}. Invalid approval chain.`,
        403
      );
    }
  }

  /**
   * Validates status change action
   */
  static validateStatusChange(approverRole: UserRole | undefined, targetRole: UserRole, newStatus: UserStatus): void {
    if (!approverRole) {
      throw new AppError('Unauthorized: User role not found', 401);
    }

    if (!this.canChangeUserStatus(approverRole, targetRole, newStatus)) {
      throw new AppError(
        `${approverRole} cannot change ${targetRole} status to ${newStatus}`,
        403
      );
    }
  }
}
