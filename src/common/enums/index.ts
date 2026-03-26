export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR',
  FIELD_STAFF = 'FIELD_STAFF',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum VendorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PatientRegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum CampStatus {
  DRAFT = 'DRAFT',
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CampCategoryScope {
  RURAL = 'RURAL',
  MID_REGION = 'MID_REGION',
  METRO = 'METRO',
}

export enum EligibilityStatus {
  ELIGIBLE = 'ELIGIBLE',
  INELIGIBLE = 'INELIGIBLE',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  CANCELLED = 'CANCELLED',
}

export enum QuestionnaireTierCode {
  TIER_0 = 'TIER_0',
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
}

export enum MemberRole {
  FIELD_STAFF = 'FIELD_STAFF',
  DOCTOR = 'DOCTOR',
}

export enum AssignmentRole {
  FIELD_STAFF = 'FIELD_STAFF',
  DOCTOR = 'DOCTOR',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  FINALIZED = 'FINALIZED',
}

export enum FileType {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  IMAGE = 'IMAGE',
}

export enum DeliveryChannel {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
}