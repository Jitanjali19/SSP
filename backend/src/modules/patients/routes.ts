import { Router } from 'express';
import { PatientController } from './controller';
import { registerPatientSchema, getPatientByIdSchema, getPatientByQRSchema } from './validation';
import { validateRequest } from '../../common/middleware/validation';
import { authenticate, authorize } from '../../common/middleware';
import { UserRole } from '../../common/enums';
import { asyncHandler } from '../../common/utils';
import { z } from 'zod';

const router = Router();
const patientController = new PatientController();

// Public routes
router.post('/register', validateRequest(registerPatientSchema), asyncHandler(patientController.registerPatient.bind(patientController)));

// Protected routes
router.use(authenticate);

// Admin-only approval endpoints - place before other :id routes
router.get('/pending', authorize(UserRole.ADMIN), asyncHandler(patientController.getPendingPatients.bind(patientController)));
router.post('/:id/approve', authorize(UserRole.ADMIN), validateRequest(z.object({ params: z.object({ id: z.string() }) })), asyncHandler(patientController.approvePatientRegistration.bind(patientController)));
router.post('/:id/reject', authorize(UserRole.ADMIN), validateRequest(z.object({ params: z.object({ id: z.string() }), body: z.object({ reason: z.string() }) })), asyncHandler(patientController.rejectPatientRegistration.bind(patientController)));

// Other patient routes
router.get('/:id', validateRequest(getPatientByIdSchema), asyncHandler(patientController.getPatientById.bind(patientController)));
router.get('/qr/:qrCode', validateRequest(getPatientByQRSchema), asyncHandler(patientController.getPatientByQR.bind(patientController)));
router.get('/:id/history', asyncHandler(patientController.getPatientHistory.bind(patientController)));
router.get('/:id/profile', asyncHandler(patientController.getPatientProfile.bind(patientController)));
router.post('/:id/generate-qr', authorize(UserRole.ADMIN), asyncHandler(patientController.generatePatientQR.bind(patientController)));
router.get('/me/reports', authorize(UserRole.PATIENT), asyncHandler(patientController.viewOwnReports.bind(patientController)));

export default router;