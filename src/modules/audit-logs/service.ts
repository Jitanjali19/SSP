import prisma from '../../config/database';
import { AuditLogData } from '../../common/types';
import { UserRole } from '@prisma/client';

export class AuditLogService {
  async createAuditLog(data: AuditLogData) {
    const actorRole: UserRole = data.actorRole;

    return prisma.auditLog.create({
      data: {
        actorUserId: data.actorUserId,
        actorRole,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        ipAddress: data.ipAddress,
        metadataJson: data.metadata || {},
      },
    });
  }

  async listAuditLogs(filters: { entityType?: string; entityId?: string; actorUserId?: string }, page: number = 1, limit: number = 10) {
    const where: any = {};
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.actorUserId) where.actorUserId = filters.actorUserId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditByEntity(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }
}