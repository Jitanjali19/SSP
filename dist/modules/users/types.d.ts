import { UserRole, UserStatus } from '@prisma/client';
export interface CreateUserRequest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
    isActive?: boolean;
}
export interface UpdateUserRequest {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
    isActive?: boolean;
}
export interface UpdateStatusRequest {
    status: UserStatus;
    isActive?: boolean;
}
//# sourceMappingURL=types.d.ts.map