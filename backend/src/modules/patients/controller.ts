import { Request, Response } from 'express';
import { PatientService } from './service';
import { RegisterPatientRequest } from './types';
import { sendSuccess } from '../../common/utils';

const patientService = new PatientService();

export class PatientController {
  async registerPatient(req: Request, res: Response) {
    const data: RegisterPatientRequest = req.body;
    const result = await patientService.registerPatient(data);
    sendSuccess(res, 'Patient registered successfully', result, 201);
  }

  async getPatientById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await patientService.getPatientById(id);
    sendSuccess(res, 'Patient retrieved successfully', result);
  }

  async getPatientByQR(req: Request, res: Response) {
    const { qrCode } = req.params;
    const result = await patientService.getPatientByQR(qrCode);
    sendSuccess(res, 'Patient retrieved successfully', result);
  }

  async getPatientHistory(req: Request, res: Response) {
    const { id } = req.params;
    const result = await patientService.getPatientHistory(id);
    sendSuccess(res, 'Patient history retrieved successfully', result);
  }

  async getPatientProfile(req: Request, res: Response) {
    const { id } = req.params;
    const result = await patientService.getPatientProfile(id);
    sendSuccess(res, 'Patient profile retrieved successfully', result);
  }

  async generatePatientQR(req: Request, res: Response) {
    const { id } = req.params;
    const result = await patientService.generatePatientQR(id);
    sendSuccess(res, 'QR code generated successfully', { qrUrl: result });
  }

  async approvePatientRegistration(req: Request, res: Response) {
    const { id } = req.params;
    const adminId = req.user!.id;
    const result = await patientService.approvePatientRegistration(id, adminId);
    sendSuccess(res, 'Patient approved successfully', result);
  }

  async rejectPatientRegistration(req: Request, res: Response) {
    const { id } = req.params;
    const adminId = req.user!.id;
    const { reason } = req.body;
    const result = await patientService.rejectPatientRegistration(id, adminId, reason);
    sendSuccess(res, 'Patient rejected successfully', result);
  }

  async getPendingPatients(req: Request, res: Response) {
    const result = await patientService.getPendingPatients();
    sendSuccess(res, 'Pending patients retrieved successfully', result);
  }
}