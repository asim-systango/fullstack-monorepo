# Day 8 Technical Implementation Plan — 10/10 Perfection & Stretch Feature Suite

## Overview & Objective

Day 8 transitions the Hospital Appointment System from "Production Ready" to **"10/10 Assessment Perfection"**. This involves addressing all security and UI audit findings, completing architecture documentation and evaluation demo scripts, implementing all 3 Stretch features (HL7/FHIR export, SMS notifications, Insurance claims), and hardening test coverage.

---

## Technical Architecture & Components

### 1. Security Hardening & Audit Fixes

- **File**: `apps/api/src/modules/appointment/appointment.controller.ts`
- **Action**: Add `@Roles('ADMIN', 'DOCTOR')` guard to `update()` method. Add service check ensuring Doctors can only update appointments associated with their assigned slots.
- **File**: `apps/web/app/(dashboard)/doctor/[id]/page.tsx`
- **Action**: Dynamically render doctor name in the empty slot schedule notice (`Dr. ${doctor.firstName} ${doctor.lastName}`).
- **File**: `apps/web/app/(dashboard)/admin/doctors/page.tsx`
- **Action**: Replace native `confirm()` with custom modal.

### 2. Architecture Documentation & Evaluation Demo

- **File**: `docs/architecture.md`
- **Action**: Document complete ERD breakdown, pessimistic locking invariants, transactional slot release, role scoping rules, and step-by-step 5-minute evaluation demo script.

### 3. Stretch 1: FHIR R4 & HL7 Medical Record Export

- **Files**:
  - `apps/api/src/modules/export/fhir.service.ts`
  - `apps/api/src/modules/export/export.controller.ts`
  - `apps/api/src/modules/export/export.module.ts`
- **Capabilities**:
  - `GET /appointments/:id/fhir` -> returns FHIR R4 JSON bundle (`Patient`, `Encounter`, `Condition`, `MedicationRequest`).
  - `GET /appointments/:id/hl7` -> returns HL7 v2 ORU^R01 text output.
  - UI export button on appointment cards with modal preview and instant file download.

### 4. Stretch 2: SMS & Notification Engine

- **Files**:
  - `apps/api/src/modules/notification/entities/notification.entity.ts`
  - `apps/api/src/modules/notification/notification.service.ts`
  - `apps/api/src/modules/notification/notification.controller.ts`
  - `apps/api/src/modules/notification/notification.module.ts`
- **Capabilities**:
  - Dispatch simulated SMS/Email notifications on appointment booking (`APPOINTMENT_SCHEDULED`), cancellation (`APPOINTMENT_CANCELLED`), and reminders.
  - Endpoints: `GET /notifications` (user feed), `POST /notifications/send-reminder` (admin/doctor manual reminder).
  - Web UI: Header notification bell icon with unread badge counter and popover drawer.

### 5. Stretch 3: Insurance Claim Processing

- **Files**:
  - `apps/api/src/modules/insurance/entities/insurance-claim.entity.ts`
  - `apps/api/src/modules/insurance/insurance.service.ts`
  - `apps/api/src/modules/insurance/insurance.controller.ts`
  - `apps/api/src/modules/insurance/insurance.module.ts`
  - `apps/web/components/insurance/insurance-claim-modal.tsx`
- **Capabilities**:
  - Create insurance claim DTO/entity linked to `Appointment` (1:1).
  - Status workflow: `SUBMITTED` -> `PROCESSING` -> `APPROVED` / `REJECTED`.
  - Calculate covered amount vs co-pay.
  - Patient claim submission modal and admin claim review page/actions.

### 6. Test Suite Hardening

- **Files**:
  - `apps/api/src/modules/slot/slot.service.spec.ts`
  - `apps/api/src/modules/export/fhir.service.spec.ts`
  - `apps/api/src/modules/insurance/insurance.service.spec.ts`

---

## Execution Checklist

- [ ] Security fix on `PATCH /appointments/:id`
- [ ] UI dynamic doctor name fix in slot empty state
- [ ] Fill `docs/architecture.md`
- [ ] Build Export Module (FHIR & HL7)
- [ ] Build Notification Engine (SMS & Header Drawer)
- [ ] Build Insurance Claim Module & UI Modal
- [ ] Add `SlotService` and Stretch Unit Tests
- [ ] Execute `pnpm typecheck`, `pnpm lint`, and `pnpm test`
