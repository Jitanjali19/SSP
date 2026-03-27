import { Request, Response } from 'express';
import { AuditLogService } from './service';
import { sendSuccess } from '../../common/utils';

const auditLogService = new AuditLogService();

export class AuditLogController {
  async listAuditLogs(req: Request, res: Response) {
    const { entityType, entityId, actorUserId, page = 1, limit = 10 } = req.query;
    const filters = { entityType: entityType as string, entityId: entityId as string, actorUserId: actorUserId as string };
    const result = await auditLogService.listAuditLogs(filters, Number(page), Number(limit));
    sendSuccess(res, 'Audit logs retrieved successfully', result);
  }

  async getAuditByEntity(req: Request, res: Response) {
    const { entityType, entityId } = req.params;
    const result = await auditLogService.getAuditByEntity(entityType, entityId);
    sendSuccess(res, 'Audit logs retrieved successfully', result);
  }
}