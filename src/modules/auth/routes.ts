import { Router } from 'express';
import { AuthController } from './controller';
import { loginSchema, registerSchema } from './validation';
import { validateRequest } from '../../common/middleware/validation';
import { asyncHandler } from '../../common/utils';

const router = Router();
const authController = new AuthController();

router.post('/login', validateRequest(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post('/register', validateRequest(registerSchema), asyncHandler(authController.register.bind(authController)));

export default router;