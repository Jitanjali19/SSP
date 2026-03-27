import { Router } from 'express';
import { AuditLogController } from './controller';
import { authenticate, authorize } from '../../common/middleware';
import { UserRole } from '../../common/enums';
import { asyncHandler } from '../../common/utils';

const router = Router();
const auditLogController = new AuditLogController();

router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get('/', asyncHandler(auditLogController.listAuditLogs.bind(auditLogController)));
router.get('/:entityType/:entityId', asyncHandler(auditLogController.getAuditByEntity.bind(auditLogController)));

export default router;