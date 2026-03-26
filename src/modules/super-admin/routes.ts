import { Router } from 'express';
import { SuperAdminController } from './controller';
import { createAdminSchema, assignModuleAccessSchema, updateAdminStatusSchema } from './validation';
import { validateRequest } from '../../common/middleware/validation';
import { authenticate, authorize } from '../../common/middleware';
import { UserRole } from '../../common/enums';
import { asyncHandler } from '../../common/utils';

const router = Router();
const superAdminController = new SuperAdminController();

router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN));

router.post('/admins', validateRequest(createAdminSchema), asyncHandler(superAdminController.createAdmin.bind(superAdminController)));
router.get('/admins', asyncHandler(superAdminController.listAdmins.bind(superAdminController)));
router.patch('/admins/:id/status', validateRequest(updateAdminStatusSchema), asyncHandler(superAdminController.updateAdminStatus.bind(superAdminController)));
router.post('/module-access', validateRequest(assignModuleAccessSchema), asyncHandler(superAdminController.assignModuleAccess.bind(superAdminController)));

export default router;