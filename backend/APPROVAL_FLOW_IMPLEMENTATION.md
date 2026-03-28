# SSP Backend Approval Flow - Implementation Summary

## Overview
Fixed the role-based approval system to ensure correct workflow for Super Admin, Admin, Vendor, and Patient roles with proper approval chains.

---

## Core Workflow

### 1. SUPER_ADMIN Flow
- **Registration**: Registers via auth/register with role SUPER_ADMIN
- **Status After Registration**: ACTIVE (auto-approved)
- **Can Login**: YES immediately (no approval needed)
- **Approval Rights**: Can approve ADMIN users only

### 2. ADMIN Flow
- **Creation**: Created by SUPER_ADMIN via `/api/super-admin/admins`
- **Status After Creation**: PENDING
- **Can Login**: NO (until approved by SUPER_ADMIN)
- **Approval By**: SUPER_ADMIN only
- **After Approval**: Status becomes ACTIVE, can login
- **Approval Rights**: Can approve VENDOR and PATIENT users

### 3. VENDOR Flow
- **Registration**: Can register via auth/register with role VENDOR, or created by ADMIN
- **Status After Registration**: PENDING
- **Vendor Record**: Created with status PENDING
- **Can Login**: NO (until approved)
- **Approval By**: ADMIN only
- **After Approval**: Status becomes ACTIVE, can login
- **Approval Rights**: Can create DOCTOR and FIELD_STAFF accounts

### 4. PATIENT Flow
- **Registration**: Registers via `/api/patients/register` (doesn't have User login account initially)
- **Status After Registration**: PENDING
- **Can Login**: NO (until approved)
- **Approval By**: ADMIN only
- **After Approval**: Can create User account and login

### 5. DOCTOR & FIELD_STAFF Flow
- **Creation**: Created by VENDOR
- **Status**: ACTIVE (created by vendor for their team)
- **Restricted Access**: Only see/modify data assigned by vendor
- **Can Login**: YES (active from creation)

---

## Changed Files

### 1. `src/modules/auth/service.ts`
**Changes**: 
- `register()`: Now sets status to ACTIVE for SUPER_ADMIN, PENDING for others
- `login()`: Added bypass for SUPER_ADMIN - allows login even if other roles are PENDING

**Key Logic**:
```typescript
// SUPER_ADMIN is auto-approved and active immediately
const statusForRole = data.role === UserRole.SUPER_ADMIN ? 'ACTIVE' : 'PENDING';

// SUPER_ADMIN bypasses approval check in login
if (user.role !== UserRole.SUPER_ADMIN && user.status !== 'ACTIVE') {
  throw new AppError('Account is pending approval or not active', 403);
}
```

### 2. `src/modules/auth/repository.ts`
**Changes**: Updated `createUser()` signature to include optional `status` and `isActive` parameters

### 3. `src/modules/super-admin/service.ts`
**Changes**: 
- `createAdmin()`: Now explicitly sets PENDING status for created admins
- `updateAdminStatus()`: Added validation using ApprovalValidator

### 4. `src/modules/super-admin/validation.ts`
**Changes**: Updated `updateAdminStatusSchema` to allow PENDING, ACTIVE, REJECTED, SUSPENDED statuses

### 5. `src/modules/patients/service.ts`
**Changes**: 
- Added verification that only ADMIN can approve/reject patients
- Added prisma import for admin verification

### 6. `src/modules/patients/routes.ts`
**Changes**: Added patient approval endpoints:
- `GET /api/patients/pending` - Get pending patients (ADMIN only)
- `POST /api/patients/:id/approve` - Approve patient (ADMIN only)
- `POST /api/patients/:id/reject` - Reject patient (ADMIN only)

### 7. `src/modules/patients/controller.ts`
**Changes**: Added methods:
- `approvePatientRegistration()`
- `rejectPatientRegistration()`
- `getPendingPatients()`

### 8. `src/modules/users/service.ts`
**Changes**: Added vendor approval methods:
- `approveVendor()`: Approves vendor, updates status to APPROVED, sets user to ACTIVE
- `rejectVendor()`: Rejects vendor, updates status to REJECTED, sets user to REJECTED
- `getPendingVendors()`: Returns vendors with PENDING status

### 9. `src/modules/users/controller.ts`
**Changes**: Added methods:
- `approveVendor()`
- `rejectVendor()`
- `getPendingVendors()`

### 10. `src/modules/users/routes.ts`
**Changes**: Added vendor approval endpoints:
- `GET /api/users/vendors/pending` - Get pending vendors (ADMIN only)
- `POST /api/users/vendors/:vendorId/approve` - Approve vendor (ADMIN only)
- `POST /api/users/vendors/:vendorId/reject` - Reject vendor (ADMIN only)

### 11. `src/common/validators/approvalValidator.ts` (NEW)
**Purpose**: Centralized validation for approval chains
**Methods**:
- `canApproveUser()`: Validates if role X can approve role Y
- `canChangeUserStatus()`: Validates status transitions
- `validateApproval()`: Throws error if approval is invalid
- `validateStatusChange()`: Throws error if status change is invalid

**Hierarchy**:
- SUPER_ADMIN → can approve ADMIN
- ADMIN → can approve VENDOR, PATIENT
- VENDOR, DOCTOR, FIELD_STAFF, LABOR, PATIENT → cannot approve anyone

---

## Approval Hierarchy Chart

```
SUPER_ADMIN (Auto-Active)
    ↓ approves
ADMIN (Pending → Active)
    ↓ approves
VENDOR (Pending → Active)
    ├─ creates → DOCTOR (Active)
    └─ creates → FIELD_STAFF (Active)
    
ADMIN also approves:
    └─ PATIENT (Pending → Active)
```

---

## Test Cases

### Test 1: Super Admin Registration and Login
**Scenario**: Super Admin registers and logs in immediately

**Request 1 - Register**:
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Super Admin User",
  "email": "superadmin@example.com",
  "phone": "9876543210",
  "password": "SecurePass123!",
  "role": "SUPER_ADMIN"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-1",
      "fullName": "Super Admin User",
      "email": "superadmin@example.com",
      "role": "SUPER_ADMIN"
    },
    "token": "jwt-token-here"
  }
}
```

**Request 2 - Login (should work immediately)**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "superadmin@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response**: ✅ Success, token issued

---

### Test 2: Admin Creation and Approval Flow
**Scenario**: Super Admin creates Admin, Admin cannot login until approved

**Request 1 - Create Admin by Super Admin**:
```http
POST /api/super-admin/admins
Authorization: Bearer {superadmin-token}
Content-Type: application/json

{
  "fullName": "District Admin",
  "email": "admin@district.com",
  "phone": "9123456789",
  "districtId": "district-uuid",
  "entitlementMetadata": {}
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "user": {
      "id": "admin-user-uuid",
      "email": "admin@district.com",
      "role": "ADMIN",
      "status": "PENDING"
    },
    "admin": {
      "id": "admin-uuid",
      "userId": "admin-user-uuid",
      "status": "PENDING"
    }
  }
}
```

**Request 2 - Admin tries to login (should fail)**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@district.com",
  "password": "defaultPassword123"
}
```

**Expected Response**: ❌ Error
```json
{
  "success": false,
  "message": "Account is pending approval or not active",
  "statusCode": 403
}
```

**Request 3 - Super Admin approves Admin**:
```http
PATCH /api/super-admin/admins/{admin-user-uuid}/status
Authorization: Bearer {superadmin-token}
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Admin status updated successfully",
  "data": {
    "id": "admin-user-uuid",
    "status": "ACTIVE"
  }
}
```

**Request 4 - Admin now can login**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@district.com",
  "password": "defaultPassword123"
}
```

**Expected Response**: ✅ Success, token issued

---

### Test 3: Vendor Registration and Approval Flow
**Scenario**: Vendor registers, Admin approves, Vendor can login

**Request 1 - Vendor registers**:
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "NGO Representative",
  "email": "vendor@ngo.com",
  "phone": "9000000000",
  "password": "VendorPass123!",
  "role": "VENDOR"
}
```

**Response**: Status = PENDING

**Request 2 - Get pending vendors (Admin checks)**:
```http
GET /api/users/vendors/pending
Authorization: Bearer {admin-token}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Pending vendors retrieved successfully",
  "data": [
    {
      "id": "vendor-uuid",
      "organizationName": "NGO Name",
      "status": "PENDING",
      "user": {
        "email": "vendor@ngo.com",
        "status": "PENDING"
      }
    }
  ]
}
```

**Request 3 - Admin approves vendor**:
```http
POST /api/users/vendors/{vendor-uuid}/approve
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Vendor approved successfully",
  "data": {
    "id": "vendor-uuid",
    "status": "APPROVED",
    "approvedByAdminId": "admin-uuid",
    "approvedAt": "2026-03-28T10:00:00Z",
    "user": {
      "email": "vendor@ngo.com",
      "status": "ACTIVE"
    }
  }
}
```

**Request 4 - Vendor can now login**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "vendor@ngo.com",
  "password": "VendorPass123!"
}
```

**Expected Response**: ✅ Success, token issued

---

### Test 4: Patient Registration and Approval Flow
**Scenario**: Patient registers without User account, Admin approves

**Request 1 - Patient registers (no login account)**:
```http
POST /api/patients/register
Content-Type: application/json

{
  "firstName": "Raj",
  "lastName": "Kumar",
  "gender": "MALE",
  "dob": "1990-01-15",
  "phone": "9111111111",
  "addressLine": "Street 1",
  "village": "Village Name",
  "city": "City Name",
  "districtId": "district-uuid",
  "state": "State",
  "pincode": "123456",
  "samagraId": "123456789"
}
```

**Expected Response**: Status = PENDING

**Request 2 - Admin gets pending patients**:
```http
GET /api/patients/pending
Authorization: Bearer {admin-token}
```

**Request 3 - Admin approves patient**:
```http
POST /api/patients/{patient-uuid}/approve
Authorization: Bearer {admin-token}
```

**Expected Response**: Patient status = APPROVED

---

### Test 5: Invalid Approval Chain Prevention
**Scenario**: Try to have Vendor approve Admin (should fail)

**Request**: Vendor tries to approve Admin
```http
PATCH /api/users/{admin-id}/status
Authorization: Bearer {vendor-token}
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

**Expected Response**: ❌ Error - Forbidden
```json
{
  "success": false,
  "message": "VENDOR cannot change ADMIN status to ACTIVE",
  "statusCode": 403
}
```

---

### Test 6: Admin Cannot Approve Another Admin
**Scenario**: Admin tries to approve Admin (should fail)

**Expected Response**: ❌ Error - Permission denied

---

## Database Schema Notes

### User Model
- `role`: UserRole (SUPER_ADMIN, ADMIN, VENDOR, DOCTOR, FIELD_STAFF, LABOR, PATIENT)
- `status`: UserStatus = PENDING | ACTIVE | REJECTED | SUSPENDED
  - **Default**: PENDING
  - **SUPER_ADMIN**: Always ACTIVE (set during registration)
  - **ADMIN**: PENDING (set during creation, waiting for SUPER_ADMIN approval)
  - **VENDOR**: PENDING (set during registration, waiting for ADMIN approval)
  - **Others**: Depends on business logic

### Vendor Model (Separate from User)
- `status`: VendorStatus = PENDING | APPROVED | REJECTED
- `approvedByAdminId`: References Admin who approved
- `approvedAt`: Timestamp of approval
- Synced with User.status during approval

### Patient Model
- `registrationStatus`: PatientRegistrationStatus = PENDING | APPROVED | REJECTED
- `approvedByAdminId`: References Admin who approved
- Separate from User model (Patient may not have User account until approved)

---

## API Endpoints Summary

### Auth Endpoints
- `POST /api/auth/register` - Register (role determines status)
- `POST /api/auth/login` - Login (SUPER_ADMIN bypass)

### Super Admin Endpoints
- `POST /api/super-admin/admins` - Create Admin (SUPER_ADMIN only)
- `GET /api/super-admin/admins` - List Admins
- `PATCH /api/super-admin/admins/{id}/status` - Approve/Reject Admin

### Patient Endpoints
- `POST /api/patients/register` - Register Patient
- `GET /api/patients/pending` - Get pending patients (ADMIN only)
- `POST /api/patients/{id}/approve` - Approve patient (ADMIN only)
- `POST /api/patients/{id}/reject` - Reject patient (ADMIN only)

### Vendor Endpoints
- `GET /api/users/vendors/pending` - Get pending vendors (ADMIN only)
- `POST /api/users/vendors/{vendorId}/approve` - Approve vendor (ADMIN only)
- `POST /api/users/vendors/{vendorId}/reject` - Reject vendor (ADMIN only)

---

## Security Considerations

1. **Role Validation**: All approval endpoints validate that the requester has the correct role
2. **Approval Chain Enforcement**: Only correct roles in the hierarchy can approve others
3. **Status Immutability**: Once approved, status can only be changed by higher authority
4. **Bypass Only for SUPER_ADMIN**: Login check bypassed ONLY for SUPER_ADMIN role
5. **Soft Delete Support**: Users can be soft-deleted but not hard-deleted

---

## Notes

1. **Seed Data**: Super Admin is created via prisma/seed.ts with status ACTIVE
2. **Default Password**: When Admin is created, default password is "defaultPassword123" (TODO: Generate proper password)
3. **Parallel Statuses**: Vendor has both User.status and Vendor.status (kept in sync)
4. **Patient Exception**: Patient doesn't require User account for registration (separate registrationStatus field)
5. **Vendor Record Creation**: Need to ensure Vendor record exists when vendor registers (requires additional implementation)

---

## Next Steps / TODOs

1. ✅ Super Admin auto-approval on registration
2. ✅ Admin requires Super Admin approval
3. ✅ Vendor requires Admin approval
4. ✅ Patient requires Admin approval
5. ⏳ Create Vendor record when vendor registers with organization details
6. ⏳ Add Doctor/Field Staff creation by Vendor
7. ⏳ Implement restricted data access for Vendor-created staff
8. ⏳ Generate secure default passwords instead of hardcoded
9. ⏳ Add email notifications for approval/rejection
10. ⏳ Add audit logging for approval actions
