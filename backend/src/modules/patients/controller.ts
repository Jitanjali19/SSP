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

  async viewOwnReports(req: Request, res: Response) {
    const patientId = req.user!.id; // Assuming patient user
    const result = await patientService.getPatientHistory(patientId);
    sendSuccess(res, 'Reports retrieved successfully', result);
  }
}