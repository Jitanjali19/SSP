import { Router } from 'express';
import { EligibilityController } from './controller';
import { authenticate } from '../../common/middleware';
import { asyncHandler } from '../../common/utils';

const router = Router();
const eligibilityController = new EligibilityController();

router.use(authenticate);
router.get('/:patientId', asyncHandler(eligibilityController.checkEligibility.bind(eligibilityController)));

export default router;