# Hospital Appointment System

# DAY 08 — 10/10 Perfection, Security Hardening, FHIR/HL7 Export, SMS Reminders & Insurance Claims

> **Goal:**
> Achieve a flawless **10/10 score across all evaluation criteria** (MUST, SHOULD, STRETCH, and Shared Grading Criteria). Day 8 resolves all audit security blockers, completes full architectural documentation and 5-minute evaluation demo scripts, implements all 3 Stretch bonus requirements (FHIR R4 / HL7 export, SMS notification engine, Insurance claims workflow), and expands unit test coverage to 100%.

---

# 1. Role

You are a Lead Healthcare Software Architect and Senior Security Engineer with extensive experience in HIPAA compliance, FHIR R4 medical interoperability standards, automated clinical workflows, and enterprise NestJS/Next.js monorepos.

Your job today is to:

- Fix all security audit findings, including securing the `PATCH /appointments/:id` endpoint with RBAC guards (`@Roles('ADMIN', 'DOCTOR')`) and strict ownership validation.
- Fix UI inconsistencies (rendering dynamic doctor names in empty states, replacing native `confirm()` with custom dialogs).
- Fully complete `docs/architecture.md` with comprehensive domain notes, ERD descriptions, and a step-by-step 5-minute evaluation demo script.
- Build **Stretch Feature 1**: HL7 / FHIR R4 Patient Medical Record Export (`GET /appointments/:id/fhir` and `GET /appointments/:id/hl7`) with instant JSON/Text download modals in the web app.
- Build **Stretch Feature 2**: Automated SMS & Email Notification Engine with an interactive notification bell popover drawer in the frontend header.
- Build **Stretch Feature 3**: Insurance Claim Processing & Coverage System (`POST /insurance-claims`, `PATCH /insurance-claims/:id/status`) with patient claim submission modals and status tracking.
- Harden unit test suites by adding `SlotService`, `FhirService`, and `InsuranceService` unit tests.

---

# 2. System Architecture (Day 8 Additions)

```text
                           ┌─────────────────────────┐
                           │   Web Portal (Next.js)  │
                           │  - Notification Drawer  │
                           │  - Insurance Claim UI   │
                           │  - FHIR / HL7 Export    │
                           └────────────┬────────────┘
                                        │ (Port 3000 /api rewrite)
                                        ▼
                           ┌─────────────────────────┐
                           │   API Gateway (Port 3001)│
                           └────────────┬────────────┘
                                        │ Upstream (Port 3002)
                                        ▼
                           ┌─────────────────────────┐
                           │   Domain API (NestJS)   │
                           ├─────────────────────────┤
                           │ - Appointment Module    │
                           │ - Export Module (FHIR)  │
                           │ - Notification Engine   │
                           │ - Insurance Claim Engine│
                           └────────────┬────────────┘
                                        │
                                        ▼
                           ┌─────────────────────────┐
                           │   PostgreSQL Database   │
                           │ - doctor_profiles       │
                           │ - slots                 │
                           │ - appointments          │
                           │ - prescriptions         │
                           │ - medical_notes         │
                           │ - insurance_claims (NEW)│
                           │ - notifications    (NEW)│
                           └─────────────────────────┘
```

---

# 3. 10/10 Perfection Matrix & Evaluation Summary

| Category    | Requirement                                  | Day 7 Baseline   | Day 8 Target     | Status    |
| ----------- | -------------------------------------------- | ---------------- | ---------------- | --------- |
| **MUST**    | Doctor profiles & slots                      | 100%             | 100%             | ✅ PASS   |
| **MUST**    | Patient booking (self-only, atomic lock)     | 100%             | 100%             | ✅ PASS   |
| **MUST**    | Cancel frees slot (transactional)            | 100%             | 100%             | ✅ PASS   |
| **MUST**    | List + date/status filters                   | 100%             | 100%             | ✅ PASS   |
| **MUST**    | Role enforcement (`@Roles` + ownership)      | 90% (PATCH open) | 100% (Secured)   | ✅ TARGET |
| **MUST**    | Soft-delete doctors deactivates future slots | 100%             | 100%             | ✅ PASS   |
| **MUST**    | `docs/architecture.md` & Demo Script         | 0% (Empty)       | 100% (Completed) | ✅ TARGET |
| **SHOULD**  | Doctor schedule CRUD                         | 100%             | 100%             | ✅ PASS   |
| **SHOULD**  | Prescriptions on completed visits            | 100%             | 100%             | ✅ PASS   |
| **SHOULD**  | Patient-scoped medical notes                 | 100%             | 100%             | ✅ PASS   |
| **SHOULD**  | Admin hospital-wide search                   | 100%             | 100%             | ✅ PASS   |
| **STRETCH** | HL7 / FHIR R4 Export                         | 0%               | 100%             | 🚀 TARGET |
| **STRETCH** | SMS Reminders & Notification Engine          | 0%               | 100%             | 🚀 TARGET |
| **STRETCH** | Insurance Claims System                      | 0%               | 100%             | 🚀 TARGET |

---

# 4. Day 8 Deliverables

- [ ] `docs/docs/day8.md` (This document)
- [ ] `docs/docs/day8_plan.md` (Technical Implementation Plan)
- [ ] `docs/docs/day8_subtasks.md` (Subtask Matrix)
- [ ] `docs/architecture.md` (Filled domain notes + ERD + 5-minute demo script)
- [ ] Security fix on `PATCH /appointments/:id` in `apps/api/src/modules/appointment/appointment.controller.ts`
- [ ] Dynamic doctor name fix in `apps/web/app/(dashboard)/doctor/[id]/page.tsx`
- [ ] FHIR R4 / HL7 Export module in `apps/api/src/modules/export/`
- [ ] SMS / Notification module in `apps/api/src/modules/notification/`
- [ ] Insurance claim processing module in `apps/api/src/modules/insurance/`
- [ ] UI components for FHIR download, Notification drawer, and Insurance modal in `apps/web/`
- [ ] `SlotService`, `FhirService`, and `InsuranceService` unit tests
