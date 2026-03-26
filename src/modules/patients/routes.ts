import { Router } from 'express';
import { PatientController } from './controller';
import { registerPatientSchema, getPatientByIdSchema, getPatientByQRSchema } from './validation';
import { validateRequest } from '../../common/middleware/validation';
import { authenticate, authorize } from '../../common/middleware';
import { UserRole } from '../../common/enums';
import { asyncHandler } from '../../common/utils';

const router = Router();
const patientController = new PatientController();

// Public routes
router.post('/register', validateRequest(registerPatientSchema), asyncHandler(patientController.registerPatient.bind(patientController)));

// Protected routes
router.use(authenticate);

router.get('/:id', validateRequest(getPatientByIdSchema), asyncHandler(patientController.getPatientById.bind(patientController)));
router.get('/qr/:qrCode', validateRequest(getPatientByQRSchema), asyncHandler(patientController.getPatientByQR.bind(patientController)));
router.get('/:id/history', asyncHandler(patientController.getPatientHistory.bind(patientController)));
router.get('/:id/profile', asyncHandler(patientController.getPatientProfile.bind(patientController)));
router.post('/:id/generate-qr', authorize(UserRole.ADMIN), asyncHandler(patientController.generatePatientQR.bind(patientController)));
router.get('/me/reports', authorize(UserRole.PATIENT), asyncHandler(patientController.viewOwnReports.bind(patientController)));

export default router;