export interface CreateAdminRequest {
  fullName: string;
  email: string;
  phone: string;
  districtId: string;
  entitlementMetadata?: Record<string, any>;
}

export interface AssignModuleAccessRequest {
  userId: string;
  moduleName: string;
  permissions: {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}