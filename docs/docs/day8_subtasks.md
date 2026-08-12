# Day 8 Subtasks & Progress Matrix

## Documentation & Capstone Specifications

- [x] Create `docs/docs/day8.md` (Day 8 Overview & 10/10 Perfection Matrix)
- [x] Create `docs/docs/day8_plan.md` (Technical Implementation Plan)
- [x] Create `docs/docs/day8_subtasks.md` (Subtask Breakdown & Progress Matrix)
- [ ] Fill `docs/architecture.md` (ERD breakdown + domain rules + 5-minute evaluation demo script)

## Security Audit & Blocker Fixes

- [ ] Secure `PATCH /appointments/:id` with `@Roles('ADMIN', 'DOCTOR')` and service ownership check
- [ ] Fix dynamic doctor name in doctor schedule empty state (`doctor/[id]/page.tsx`)
- [ ] Replace native `confirm()` in admin doctors page with custom confirmation modal

## Stretch Feature 1: HL7 / FHIR R4 Patient Record Export

- [ ] Create `FhirService` in `apps/api/src/modules/export/fhir.service.ts`
- [ ] Create `ExportController` in `apps/api/src/modules/export/export.controller.ts`
- [ ] Register `ExportModule` in `apps/api/src/app.module.ts`
- [ ] Add "Export FHIR / HL7 Record" button and modal on appointment cards in web UI

## Stretch Feature 2: SMS Reminders & Notification Engine

- [ ] Create `Notification` entity and module in `apps/api/src/modules/notification/`
- [ ] Dispatch simulated SMS/Email notifications on appointment booking, cancellation, and reminders
- [ ] Register `NotificationModule` in `apps/api/src/app.module.ts`
- [ ] Add interactive Notification Bell popover drawer in frontend `ShellHeader`

## Stretch Feature 3: Insurance Claim Processing & Coverage System

- [ ] Create `InsuranceClaim` entity and module in `apps/api/src/modules/insurance/`
- [ ] Implement claim submission, status transitions (`SUBMITTED` -> `PROCESSING` -> `APPROVED` / `REJECTED`), and coverage calculation
- [ ] Register `InsuranceModule` in `apps/api/src/app.module.ts`
- [ ] Add "Submit Insurance Claim" modal and claim status badge to web UI

## Verification & Unit Testing

- [ ] Implement `SlotService` unit tests (`apps/api/src/modules/slot/slot.service.spec.ts`)
- [ ] Implement `FhirService` unit tests (`apps/api/src/modules/export/fhir.service.spec.ts`)
- [ ] Implement `InsuranceService` unit tests (`apps/api/src/modules/insurance/insurance.service.spec.ts`)
- [ ] Run `pnpm typecheck` (0 TypeScript errors)
- [ ] Run `pnpm lint` (0 ESLint errors)
- [ ] Run `pnpm test` (All backend tests passing)
