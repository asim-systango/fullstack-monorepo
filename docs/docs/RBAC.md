# Role-Based Access Control (RBAC) Specification

## Overview

The platform uses standard enterprise Role-Based Access Control (RBAC) enforcing strict separation of duties across **ADMIN**, **DOCTOR**, and **PATIENT** roles.

---

## Role Matrix & Permissions

| Resource / Endpoint | ADMIN | DOCTOR | PATIENT |
| :--- | :---: | :---: | :---: |
| **Authentication (/auth/\*)** | ✅ Public/Self | ✅ Public/Self | ✅ Public/Self |
| **Browse Doctors (`GET /doctors`)** | ✅ | ✅ | ✅ |
| **Manage Doctor Profiles (`POST/PATCH/DELETE /doctors`)** | ✅ | ❌ | ❌ |
| **View Own Appointments** | ✅ All | ✅ Own | ✅ Own |
| **Manage Own Doctor Slots** | ❌ | ✅ | ❌ |
| **Book & Cancel Appointments** | ❌ | ❌ | ✅ |
| **Create Prescriptions & Medical Notes** | ❌ | ✅ | ❌ |
| **Admin System Settings (`/admin/*`)** | ✅ | ❌ | ❌ |

---

## Backend Guards Implementation

Role protection is declared via custom metadata decorator `@Roles(Role.ADMIN, ...)` and verified globally via `RolesGuard`:

```typescript
@Roles(Role.ADMIN)
@Delete(':id')
remove(@Param('id') id: string) {
  return this.doctorService.remove(id);
}
```

If an unauthorized user attempts access, `RolesGuard` throws `403 Forbidden`:

```json
{
  "statusCode": 403,
  "message": "User with role 'PATIENT' is forbidden from accessing this resource",
  "error": "Forbidden"
}
```

---

## Frontend Protected Routes

Client-side navigation is protected by `ProtectedRoute` wrapper component:
- Unauthenticated requests are redirected to `/login`.
- Unauthorized role access triggers redirect to `/unauthorized` (403 Page).
