# Day 9 Technical Implementation Plan — Enterprise Schema, Seeding & DB View

## Overview & Objective

Day 9 delivers end-to-end implementation of the **Enterprise Multi-Hospital Management System Architecture** as specified in `docs/docs/DATABASE_DESIGN.md`.

---

## Component Architecture

### 1. TypeORM Domain Entities Expansion

- Location: `apps/api/src/modules/`
- Entities:
  - IAM: `Hospital`, `HospitalBranch`, `UserRole`, `PatientProfile`
  - Organization: `Department`, `DoctorProfile`, `DoctorDepartment`, `StaffProfile`
  - OPD & Scheduling: `DoctorSchedule`, `Slot`, `Appointment`
  - EHR: `Encounter`, `MedicalNote`, `Prescription`, `PrescriptionItem`
  - IPD: `Ward`, `Bed`, `Admission`
  - Billing: `Invoice`, `InvoiceItem`, `Payment`, `InsuranceClaim`
  - Governance: `AuditLog`

### 2. Comprehensive Database Seeder

- File: `apps/api/src/database/seed.ts`
- Performs sequential cleanup and populates all 19 entities with realistic multi-tenant data (e.g. City General Hospital, Cardiology / Orthopedics departments, doctors, patients, admissions, beds, invoices, SOAP notes, audit logs).

### 3. Database Explorer API (DB View)

- Module: `apps/api/src/modules/db-explorer/`
- Endpoints:
  - `GET /api/db-explorer/tables`: List all database tables, total row counts, column counts.
  - `GET /api/db-explorer/tables/:tableName`: Fetch paginated data, column schemas, foreign keys.

### 4. Admin Database Explorer UI

- Route: `/admin/db-explorer` in `apps/web/app/(dashboard)/admin/db-explorer/page.tsx`
- Components:
  - Table selection drawer & search box.
  - Table stats header (total rows, columns, primary key).
  - Paginated data grid with status badges.
  - JSON modal view for structured JSONB columns (`medical_history`, `address`, `changes_after`).

---

## Execution Checklist

- [ ] Create Day 9 Entities
- [ ] Update TypeORM Data Source & Module imports
- [ ] Build Seeder script for all 19 entities
- [ ] Build DbExplorerModule in API
- [ ] Build Web UI at `/admin/db-explorer`
- [ ] Verify `pnpm typecheck`, `pnpm lint`, and `pnpm seed`
