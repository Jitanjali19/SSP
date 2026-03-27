export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VENDOR' | 'FIELD_STAFF' | 'DOCTOR' | 'PATIENT';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  qrCode?: string;
  registrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface EligibilityCheck {
  isEligible: boolean;
  lastCheckDate?: string;
  nextDueDate?: string;
}

export interface QuestionnaireResponse {
  tier: 'TIER_0' | 'TIER_1' | 'TIER_2';
  responses: Record<string, any>;
  diagnosis?: string;
  prescription?: string;
  remarks?: string;
}

export interface Camp {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}