import { Router } from 'express';
import { UsersController } from './controller';
import { validateRequest } from '../../common/middleware/validation';
import { asyncHandler } from '../../common/utils';
import { authenticate, authorize } from '../../common/middleware';
import { createUserSchema, updateUserSchema, userIdSchema, changeStatusSchema } from './validation';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const usersController = new UsersController();

router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(createUserSchema),
  asyncHandler(usersController.createUser.bind(usersController))
);

router.get(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  asyncHandler(usersController.getAllUsers.bind(usersController))
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(userIdSchema),
  asyncHandler(usersController.getUserById.bind(usersController))
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(updateUserSchema),
  asyncHandler(usersController.updateUser.bind(usersController))
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(userIdSchema),
  asyncHandler(usersController.softDeleteUser.bind(usersController))
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(changeStatusSchema),
  asyncHandler(usersController.changeUserStatus.bind(usersController))
);

// Vendor approval endpoints - ADMIN only
router.get(
  '/vendors/pending',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(usersController.getPendingVendors.bind(usersController))
);

router.post(
  '/vendors/:vendorId/approve',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(z.object({ params: z.object({ vendorId: z.string() }) })),
  asyncHandler(usersController.approveVendor.bind(usersController))
);

router.post(
  '/vendors/:vendorId/reject',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(z.object({ params: z.object({ vendorId: z.string() }), body: z.object({ reason: z.string() }) })),
  asyncHandler(usersController.rejectVendor.bind(usersController))
);

export default router;

