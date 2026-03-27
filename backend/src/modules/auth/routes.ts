import { Router } from 'express';
import { AuthController } from './controller';
import { loginSchema, registerSchema, changePasswordSchema } from './validation';
import { validateRequest } from '../../common/middleware/validation';
import { asyncHandler } from '../../common/utils';
import { authenticate } from '../../common/middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', validateRequest(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post('/register', validateRequest(registerSchema), asyncHandler(authController.register.bind(authController)));
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));
router.get('/me', authenticate, asyncHandler(authController.me.bind(authController)));
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), asyncHandler(authController.changePassword.bind(authController)));

export default router;