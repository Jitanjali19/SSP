export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    pagination?: PaginationMeta;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: PaginationMeta;
}
import { UserRole } from '@prisma/client';
export interface UserPayload {
    id: string;
    role: UserRole;
    email: string;
}
export interface AuditLogData {
    actorUserId: string;
    actorRole: UserRole;
    action: string;
    entityType: string;
    entityId: string;
    ipAddress: string;
    metadata?: Record<string, any>;
}
//# sourceMappingURL=index.d.ts.map