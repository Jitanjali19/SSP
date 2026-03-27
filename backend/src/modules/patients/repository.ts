import prisma from '../../config/database';
import { Patient, PatientRegistrationStatus, Gender } from '@prisma/client';

export type CreatePatientInput = {
  samagraId?: string;
  abhaId?: string;
  maskedSamagraId?: string;
  maskedAbhaId?: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: Date;
  age: number;
  phone: string;
  addressLine: string;
  village: string;
  city: string;
  districtId: string;
  state: string;
  pincode: string;
  registrationStatus: PatientRegistrationStatus;
  approvedByAdminId?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  nextDueDate?: Date;
};

export class PatientRepository {
  async createPatient(data: CreatePatientInput): Promise<Patient> {
    return prisma.patient.create({ data });
  }

  async findPatientById(id: string): Promise<Patient | null> {
    return prisma.patient.findUnique({ where: { id } });
  }

  async findPatientBySamagraId(samagraId: string): Promise<Patient | null> {
    return prisma.patient.findUnique({ where: { samagraId } });
  }

  async findPatientByAbhaId(abhaId: string): Promise<Patient | null> {
    return prisma.patient.findUnique({ where: { abhaId } });
  }

  async findPatientByQR(qrCodeValue: string): Promise<Patient | null> {
    return prisma.patient.findUnique({ where: { qrCodeValue } });
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    return prisma.patient.update({ where: { id }, data });
  }

  async getPatientHistory(patientId: string) {
    return prisma.patientCampVisit.findMany({
      where: { patientId },
      include: {
        camp: true,
        assessment: true,
        report: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingPatients(): Promise<Patient[]> {
    return prisma.patient.findMany({
      where: { registrationStatus: PatientRegistrationStatus.PENDING },
      include: { district: true },
    });
  }
}