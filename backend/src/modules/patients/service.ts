import { PatientRepository } from './repository';
import { AuthRepository } from '../auth/repository';
import { RegisterPatientRequest, PatientProfile } from './types';
import { PatientRegistrationStatus } from '@prisma/client';
import { calculateAge, maskId, generateQRCode, generateUUID } from '../../common/utils';
import { SamagraService } from '../../common/services/SamagraService';
import { AbhaService } from '../../common/services/AbhaService';
import { AppError } from '../../common/errors/AppError';
import prisma from '../../config/database';

const patientRepo = new PatientRepository();
const authRepo = new AuthRepository();
const samagraService = new SamagraService();
const abhaService = new AbhaService();

export class PatientService {
  async registerPatient(data: RegisterPatientRequest): Promise<PatientProfile> {
    // Check for existing patient
    if (data.samagraId) {
      const existing = await patientRepo.findPatientBySamagraId(data.samagraId);
      if (existing) throw new AppError('Patient with this Samagra ID already exists', 409);
    }
    if (data.abhaId) {
      const existing = await patientRepo.findPatientByAbhaId(data.abhaId);
      if (existing) throw new AppError('Patient with this ABHA ID already exists', 409);
    }

    // Fetch identity if provided
    let fetchedData: any = {};
    if (data.samagraId) {
      fetchedData = await samagraService.fetchIdentity(data.samagraId);
    } else if (data.abhaId) {
      fetchedData = await abhaService.fetchIdentity(data.abhaId);
    }

    const dob = new Date(data.dob);
    const age = calculateAge(dob);

    const patient = await patientRepo.createPatient({
      samagraId: data.samagraId,
      abhaId: data.abhaId,
      maskedSamagraId: data.samagraId ? maskId(data.samagraId) : undefined,
      maskedAbhaId: data.abhaId ? maskId(data.abhaId) : undefined,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      dob,
      age,
      phone: data.phone,
      addressLine: data.addressLine,
      village: data.village,
      city: data.city,
      districtId: data.districtId,
      state: data.state,
      pincode: data.pincode,
      registrationStatus: PatientRegistrationStatus.PENDING,
    });

    return this.mapToProfile(patient);
  }

  async getPatientById(id: string): Promise<PatientProfile> {
    const patient = await patientRepo.findPatientById(id);
    if (!patient) throw new AppError('Patient not found', 404);
    return this.mapToProfile(patient);
  }

  async getPatientByQR(qrCode: string): Promise<PatientProfile> {
    const patient = await patientRepo.findPatientByQR(qrCode);
    if (!patient) throw new AppError('Patient not found', 404);
    return this.mapToProfile(patient);
  }

  async getPatientHistory(patientId: string) {
    return patientRepo.getPatientHistory(patientId);
  }

  async getPatientProfile(patientId: string): Promise<PatientProfile> {
    return this.getPatientById(patientId);
  }

  async generatePatientQR(patientId: string): Promise<string> {
    const patient = await patientRepo.findPatientById(patientId);
    if (!patient) throw new AppError('Patient not found', 404);
    if (patient.registrationStatus !== 'APPROVED') throw new AppError('Patient not approved', 403);

    const qrValue = generateUUID();
    const qrUrl = await generateQRCode(qrValue);

    await patientRepo.updatePatient(patientId, {
      qrCodeValue: qrValue,
      qrCodeUrl: qrUrl,
    });

    return qrUrl;
  }

  async approvePatientRegistration(patientId: string, adminId: string) {
    const patient = await patientRepo.findPatientById(patientId);
    if (!patient) throw new AppError('Patient not found', 404);

    // Verify that the requester is actually an ADMIN
    const admin = await prisma.admin.findUnique({ where: { userId: adminId } });
    if (!admin) {
      throw new AppError('Only ADMIN can approve patients', 403);
    }

    await patientRepo.updatePatient(patientId, {
      registrationStatus: PatientRegistrationStatus.APPROVED,
      approvedByAdminId: adminId,
      approvedAt: new Date(),
    });

    return this.getPatientById(patientId);
  }

  async rejectPatientRegistration(patientId: string, adminId: string, reason: string) {
    const patient = await patientRepo.findPatientById(patientId);
    if (!patient) throw new AppError('Patient not found', 404);

    // Verify that the requester is actually an ADMIN
    const admin = await prisma.admin.findUnique({ where: { userId: adminId } });
    if (!admin) {
      throw new AppError('Only ADMIN can reject patients', 403);
    }

    await patientRepo.updatePatient(patientId, {
      registrationStatus: PatientRegistrationStatus.REJECTED,
      approvedByAdminId: adminId,
      rejectionReason: reason,
    });

    return this.getPatientById(patientId);
  }

  async getPendingPatients() {
    return patientRepo.getPendingPatients();
  }

  async getOwnReports(userId: string) {
    // Find the patient record for this user
    const patient = await patientRepo.findPatientByUserId(userId);
    if (!patient) {
      throw new AppError('Patient record not found', 404);
    }

    // Get patient's camp visit history which includes reports
    const history = await patientRepo.getPatientHistory(patient.id);

    // Filter to only include visits that have reports
    const reports = history.filter(visit => visit.report).map(visit => ({
      id: visit.report!.id,
      patientVisitId: visit.report!.patientVisitId,
      diagnosis: visit.report!.diagnosis,
      prescription: visit.report!.prescription,
      remarks: visit.report!.remarks,
      reportSummary: visit.report!.reportSummary,
      reportStatus: visit.report!.reportStatus,
      submittedAt: visit.report!.submittedAt,
      createdAt: visit.report!.createdAt,
      camp: {
        id: visit.camp.id,
        name: visit.camp.campName,
        venue: visit.camp.venueName,
        address: visit.camp.address,
        campDate: visit.camp.scheduledDate,
      },
      assessedBy: {
        id: visit.report!.assessedBy.id,
        fullName: visit.report!.assessedBy.fullName,
        role: visit.report!.assessedBy.role,
      },
      documents: visit.report!.documents,
    }));

    return reports;
  }

  private mapToProfile(patient: any): PatientProfile {
    return {
      id: patient.id,
      samagraId: patient.samagraId,
      abhaId: patient.abhaId,
      maskedSamagraId: patient.maskedSamagraId,
      maskedAbhaId: patient.maskedAbhaId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      gender: patient.gender,
      dob: patient.dob,
      age: patient.age,
      phone: patient.phone,
      addressLine: patient.addressLine,
      village: patient.village,
      city: patient.city,
      districtId: patient.districtId,
      state: patient.state,
      pincode: patient.pincode,
      qrCodeValue: patient.qrCodeValue,
      qrCodeUrl: patient.qrCodeUrl,
      registrationStatus: patient.registrationStatus,
      nextDueDate: patient.nextDueDate,
    };
  }
}