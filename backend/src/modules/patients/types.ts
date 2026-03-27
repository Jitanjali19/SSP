import { Gender, PatientRegistrationStatus } from '@prisma/client';

export interface RegisterPatientRequest {
  samagraId?: string;
  abhaId?: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string;
  phone: string;
  addressLine: string;
  village: string;
  city: string;
  districtId: string;
  state: string;
  pincode: string;
}

export interface PatientProfile {
  id: string;
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
  qrCodeValue?: string;
  qrCodeUrl?: string;
  registrationStatus: PatientRegistrationStatus;
  nextDueDate?: Date;
}