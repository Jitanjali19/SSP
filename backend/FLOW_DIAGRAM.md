# Approval Flow Diagram

## Complete User Approval Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER REGISTRATION & APPROVAL FLOW                     │
└─────────────────────────────────────────────────────────────────────────────┘

1. SUPER_ADMIN FLOW
═══════════════════════════════════════════════════════════════════════════════

    ┌──────────────────────────────┐
    │ POST /api/auth/register      │
    │ role: SUPER_ADMIN            │
    └───────────────┬──────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │  Create User                 │
    │  status: ACTIVE          ✅  │ ◄─── Auto-approved
    │  isActive: true              │
    └───────────────┬──────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │ POST /api/auth/login         │
    │ email & password             │
    └───────────────┬──────────────┘
                    │
        ┌───────────┴───────────┐
        │ Check: role ==        │
        │ SUPER_ADMIN?          │
        └───┬───────────────┬───┘
            │ YES           │ NO
            ▼               ▼
        ✅ LOGIN         ❌ BLOCKED
        TOKEN ISSUED    (if PENDING)


2. ADMIN FLOW
═══════════════════════════════════════════════════════════════════════════════

    ┌──────────────────────────────────────┐
    │ POST /api/super-admin/admins         │
    │ (SUPER_ADMIN creates ADMIN)          │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │  Create User                         │
    │  status: PENDING                 ⏳  │ ◄─── Requires approval
    │  isActive: false                     │
    │  role: ADMIN                         │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │ POST /api/auth/login (ADMIN tries)   │
    │ email & password                     │
    └───────────────┬──────────────────────┘
                    │
                    ▼
        ↻ BLOCKED ❌
        'Account is pending approval'
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │ SUPER_ADMIN approves:                │
    │ PATCH /api/super-admin/admins/{id}   │
    │ status: ACTIVE                       │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │  Update User                         │
    │  status: ACTIVE                  ✅  │
    │  isActive: true                      │
    │  Timestamp: now                      │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    Now ADMIN can login & access dashboard


3. VENDOR FLOW
═══════════════════════════════════════════════════════════════════════════════

    ┌──────────────────────────────────────┐
    │ POST /api/auth/register              │
    │ role: VENDOR                         │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │  Create User                         │
    │  status: PENDING                 ⏳  │
    │  role: VENDOR                        │
    └───────────────┬──────────────────────┘
    
    ┌──────────────────────────────────────┐
    │  Create Vendor Record                │
    │  status: PENDING                 ⏳  │
    │  approvedByAdminId: null             │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │ VENDOR tries to login                │
    │ POST /api/auth/login                 │
    └───────────────┬──────────────────────┘
                    │
                    ▼
        ↻ BLOCKED ❌
        'Account is pending approval'
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │ ADMIN reviews pending vendors:       │
    │ GET /api/users/vendors/pending       │
    │ (checks list of pending vendors)     │
    └───────────────┬──────────────────────┘
                    │
                    ├─── Approve
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │ ADMIN approves:                      │
    │ POST /api/users/vendors/{id}/approve │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │  Update Vendor Record                │
    │  status: APPROVED                ✅  │
    │  approvedByAdminId: {admin.id}       │
    │  approvedAt: now                     │
    └───────────────┬──────────────────────┘
    
    ┌──────────────────────────────────────┐
    │  Update User                         │
    │  status: ACTIVE                  ✅  │
    │  isActive: true                      │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    Now VENDOR can login & create staff


4. PATIENT FLOW
═══════════════════════════════════════════════════════════════════════════════

    ┌──────────────────────────────────────┐
    │ POST /api/patients/register          │
    │ (Samagra/ABHA details)               │
    │ NO User account created yet          │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │  Create Patient Record               │
    │  registrationStatus: PENDING      ⏳ │
    │  NO associated User                  │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │ ADMIN reviews pending patients:      │
    │ GET /api/patients/pending            │
    └───────────────┬──────────────────────┘
                    │
                    ├─── Approve
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │ ADMIN approves:                      │
    │ POST /api/patients/{id}/approve      │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │  Update Patient                      │
    │  registrationStatus: APPROVED    ✅  │
    │  approvedByAdminId: {admin.id}       │
    │  approvedAt: now                     │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │ Create User account for Patient      │
    │ (or Patient creates own User)        │
    │ role: PATIENT                        │
    │ status: ACTIVE                   ✅  │
    └───────────────┬──────────────────────┘
                    │
                    ▼
    Now PATIENT can login


5. INVALID ACTION PREVENTION
═══════════════════════════════════════════════════════════════════════════════

    ❌ VENDOR tries to approve ADMIN
       → Error: "VENDOR cannot change ADMIN status to ACTIVE"
    
    ❌ ADMIN tries to approve ADMIN
       → Error: "ADMIN cannot approve ADMIN"
    
    ❌ PATIENT tries to approve VENDOR
       → Error: "PATIENT cannot approve VENDOR"
    
    ❌ ADMIN tries to approve SUPER_ADMIN
       → Error: "Only SUPER_ADMIN can change admin status"
    
    ❌ VENDOR tries to login before ADMIN approval
       → Error: "Account is pending approval or not active"


STATUS CODES & MEANINGS
═══════════════════════════════════════════════════════════════════════════════

    PENDING     ⏳  Created but not approved
    ACTIVE      ✅  Approved and can login
    REJECTED    ❌  Rejected by approver
    SUSPENDED   🚫  Blocked/disabled temporarily


ERROR RESPONSES
═══════════════════════════════════════════════════════════════════════════════

    401 Invalid credentials           → Wrong email/password
    403 Account is pending approval   → Status is not ACTIVE (except SUPER_ADMIN)
    403 {Role} cannot approve {Role}  → Invalid approval chain
    404 {Entity} not found            → Resource doesn't exist
    409 {Entity} already exists       → Duplicate email/unique constraint


SUCCESS RESPONSES
═══════════════════════════════════════════════════════════════════════════════

    200 OK                            → Request successful
    201 Created                       → Resource created (registration/creation)
    Token issued                      → Login successful
    Status updated                    → Approval/rejection successful


ASYNC FLOW SUMMARY
═══════════════════════════════════════════════════════════════════════════════

    User Registration
         │
         ├─ SUPER_ADMIN ──────────────────┐
         │                                 │
         ├─ ADMIN/VENDOR/PATIENT ────┐   │
         │                            │   │
    Accept from different entry points:  │
    ├─ auth/register                     │
    ├─ super-admin/admins (for ADMIN)   │
    ├─ patients/register (for PATIENT)  │
         │                               │
         ▼                               ▼
    Set Status = PENDING            Set Status = ACTIVE
    Wait for approval               Can login immediately
         │                               │
         ▼                               ▼
    Cannot Login                    Login Successful
         │
         ▼
    APPROVER Reviews
         │
         ├─ Approve ────→ Status = ACTIVE ──→ Can Login
         │
         └─ Reject ─────→ Status = REJECTED ─→ Cannot Login
```

---

## Quick Reference: Status Transitions

```
SUPER_ADMIN:
    Registration ──┐
                   ├─→ [ACTIVE] ──(created by seed)──→ Always [ACTIVE]
                   └─→ [ACTIVE] ──(via api registration)──→ Always [ACTIVE]

ADMIN:
    Created ┐
            └─→ [PENDING] ──(SUPER_ADMIN approves)──→ [ACTIVE] ──(SUPER_ADMIN suspends)──→ [SUSPENDED]
                              │
                              └─(SUPER_ADMIN rejects)──→ [REJECTED]

VENDOR:
    Registered ┐
               └─→ [PENDING] ──(ADMIN approves)──→ [ACTIVE] ──(ADMIN suspends)──→ [SUSPENDED]
                               │
                               └─(ADMIN rejects)──→ [REJECTED]

PATIENT:
    Registered ┐
               └─→ [PENDING] ──(ADMIN approves)──→ [APPROVED] ──(create User)──→ User [ACTIVE]
                               │
                               └─(ADMIN rejects)──→ [REJECTED]

DOCTOR/FIELD_STAFF:
    Created by VENDOR ──→ [ACTIVE] (no approval needed)
```

---

## Request/Response Flow Examples

### Example 1: SUPER_ADMIN Login (Immediate)
```
REQUEST:  POST /api/auth/register
BODY:     { role: "SUPER_ADMIN", ... }
              ↓
PROCESSING: statusForRole = 'ACTIVE'
              ↓
DATABASE:  User { status: 'ACTIVE', isActive: true }
              ↓
RESPONSE:  { token, user }
              ↓
LOGIN:     POST /api/auth/login
              ↓
CHECK:     role === 'SUPER_ADMIN' ? bypass : check status
              ↓
RESULT:    TOKEN ISSUED ✅
```

### Example 2: VENDOR Login (Blocked Initially)
```
REQUEST:  POST /api/auth/register
BODY:     { role: "VENDOR", ... }
              ↓
DATABASE:  User { status: 'PENDING', isActive: false }
           Vendor { status: 'PENDING' }
              ↓
LOGIN:     POST /api/auth/login
              ↓
CHECK:     role === 'VENDOR'? No bypass
           status !== 'ACTIVE'? True
              ↓
ERROR:     403 - "Account is pending approval" ❌
              ↓
ADMIN:     POST /api/users/vendors/{id}/approve
              ↓
UPDATE:    Vendor { status: 'APPROVED' }
           User { status: 'ACTIVE', isActive: true }
              ↓
LOGIN:     POST /api/auth/login (retry)
              ↓
TOKEN:     TOKEN ISSUED ✅
```
