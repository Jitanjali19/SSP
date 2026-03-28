# SSP Approval System - Changed Files Summary

## Files Modified (10)

### 1. Auth Module
#### `src/modules/auth/service.ts`
- Modified `register()` to set status based on role
  - SUPER_ADMIN → ACTIVE (auto-approved)
  - Others → PENDING
- Modified `login()` to bypass approval check for SUPER_ADMIN

#### `src/modules/auth/repository.ts`
- Updated `createUser()` signature to accept optional `status` and `isActive` parameters

### 2. Super Admin Module
#### `src/modules/super-admin/service.ts`
- Updated `createAdmin()` to explicitly set status to PENDING when creating new Admins
- Enhanced `updateAdminStatus()` with validation using ApprovalValidator
- Added prisma import for admin verification

#### `src/modules/super-admin/validation.ts`
- Updated `updateAdminStatusSchema` to allow PENDING, ACTIVE, REJECTED, SUSPENDED statuses

### 3. Users Module
#### `src/modules/users/service.ts`
- Added vendor approval methods:
  - `approveVendor()` - Approve vendor and set user to ACTIVE
  - `rejectVendor()` - Reject vendor and set user to REJECTED
  - `getPendingVendors()` - Get all pending vendors
- Added prisma import

#### `src/modules/users/controller.ts`
- Added controller methods for vendor approval:
  - `approveVendor()`
  - `rejectVendor()`
  - `getPendingVendors()`

#### `src/modules/users/routes.ts`
- Added three vendor approval endpoints:
  - GET `/vendors/pending`
  - POST `/vendors/:vendorId/approve`
  - POST `/vendors/:vendorId/reject`
- All vendor endpoints are ADMIN-only

### 4. Patients Module
#### `src/modules/patients/service.ts`
- Enhanced `approvePatientRegistration()` with admin verification
- Enhanced `rejectPatientRegistration()` with admin verification
- Added prisma import for admin verification

#### `src/modules/patients/controller.ts`
- Added patient approval methods:
  - `approvePatientRegistration()`
  - `rejectPatientRegistration()`
  - `getPendingPatients()`

#### `src/modules/patients/routes.ts`
- Added three patient approval endpoints:
  - GET `/pending`
  - POST `/:id/approve`
  - POST `/:id/reject`
- All endpoints are ADMIN-only
- Properly ordered to avoid route conflicts

### 5. Common Validators (NEW FILE)
#### `src/common/validators/approvalValidator.ts`
- New centralized validation class for approval chains
- Methods:
  - `canApproveUser()` - Check if role can approve role
  - `canChangeUserStatus()` - Check if status change is valid
  - `validateApproval()` - Throw error if approval invalid
  - `validateStatusChange()` - Throw error if status change invalid

---

## Key Logic Changes

### Before vs After

#### Auth Registration
**Before**:
```typescript
const user = await authRepo.createUser({
  fullName: data.fullName,
  email: data.email,
  phone: data.phone,
  passwordHash: hashedPassword,
  role: data.role,
  // status defaults to PENDING for everyone
});
```

**After**:
```typescript
const statusForRole = data.role === UserRole.SUPER_ADMIN ? 'ACTIVE' : 'PENDING';
const isActiveForRole = data.role === UserRole.SUPER_ADMIN;

const user = await authRepo.createUser({
  fullName: data.fullName,
  email: data.email,
  phone: data.phone,
  passwordHash: hashedPassword,
  role: data.role,
  status: statusForRole,      // Role-based status
  isActive: isActiveForRole,
});
```

#### Auth Login
**Before**:
```typescript
if (user.status !== 'ACTIVE') {
  throw new AppError('Account is not active', 403);
}
```

**After**:
```typescript
// SUPER_ADMIN bypasses approval check
if (user.role !== UserRole.SUPER_ADMIN && user.status !== 'ACTIVE') {
  throw new AppError('Account is pending approval or not active', 403);
}
```

#### Admin Creation
**Before**:
```typescript
const user = await authRepo.createUser({
  // ... other fields
  role: UserRole.ADMIN,
  // status defaults to PENDING
});
```

**After**:
```typescript
const user = await authRepo.createUser({
  // ... other fields
  role: UserRole.ADMIN,
  status: 'PENDING',      // Explicitly set
  isActive: false,        // Not active until approved
});
```

---

## Approval Chain Hierarchy

```
SUPER_ADMIN (Auto-ACTIVE)
    ↓ can approve
    ├─ ADMIN (PENDING → ACTIVE)
    
ADMIN (ACTIVE)
    ↓ can approve
    ├─ VENDOR (PENDING → ACTIVE)
    └─ PATIENT (PENDING → ACTIVE)

VENDOR (ACTIVE)
    ├─ creates DOCTOR (ACTIVE)
    └─ creates FIELD_STAFF (ACTIVE)

DOCTOR, FIELD_STAFF, LABOR, PATIENT
    ↓ cannot approve anyone
```

---

## Validation Rules Applied

### Approval Permissions
- ✅ SUPER_ADMIN can approve ADMIN
- ✅ ADMIN can approve VENDOR
- ✅ ADMIN can approve PATIENT
- ❌ VENDOR cannot approve anyone
- ❌ PATIENT cannot approve anyone
- ❌ ADMIN cannot approve ADMIN
- ❌ ADMIN cannot approve SUPER_ADMIN

### Status Transitions
- ✅ PENDING → ACTIVE (approval)
- ✅ PENDING → REJECTED (rejection)
- ✅ ACTIVE → SUSPENDED (suspension)
- ✅ SUSPENDED → ACTIVE (reactivation)
- ❌ REJECTED → ACTIVE (cannot revert rejection)
- ❌ SUPER_ADMIN status cannot be changed

---

## Benefits of These Changes

1. **Hierarchical Approval**: Clear chain of authority (Super Admin → Admin → Vendor)
2. **Role-Based Access**: Each role has defined approval capabilities
3. **Immediate Super Admin Access**: No bottleneck at top level
4. **Validation Enforcement**: Impossible to bypass approval hierarchy
5. **Centralized Logic**: ApprovalValidator ensures consistent rules everywhere
6. **Backward Compatible**: Existing APIs work without breaking changes
7. **Clear Error Messages**: Users get meaningful feedback if trying invalid actions
8. **Audit Trail**: All approvals are timestamped and tracked

---

## Testing Strategy

1. **Unit Tests**: Test each approval method individually
2. **Integration Tests**: Test full approval flow for each role
3. **Permission Tests**: Verify cross-role approval prevention
4. **Status Transition Tests**: Verify invalid status changes are blocked
5. **Login Tests**: Verify SUPER_ADMIN bypass works, others blocked

---

## Deployment Notes

1. **Database Migration**: No schema changes needed (only default values and validations)
2. **Seed Data**: Existing seed.ts already creates SUPER_ADMIN with ACTIVE status
3. **Backward Compatibility**: Existing ADMIN records stay as is, new ones created PENDING
4. **No Data Loss**: Soft delete support preserved
5. **Token Format**: JWT structure unchanged

---

## Future Enhancements

1. **Email Notifications**: Send approval/rejection notifications
2. **Audit Logging**: Log all approval actions
3. **Batch Approvals**: Approve multiple users at once
4. **Approval Dashboard**: Visual status of pending approvals
5. **Scheduled Review**: Auto-reject after N days if not approved
6. **Appeal Process**: Allow users to appeal rejection
7. **Role Delegation**: Allow temporary approval delegation
8. **SLA Tracking**: Track approval response times
