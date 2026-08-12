# Hospital Appointment System

# DAY 09 — Enterprise Multi-Hospital Database Architecture, Seeding Engine & DB Explorer

> **Goal:**
> Realize the complete **Enterprise Multi-Tenant Hospital Management System (HMS)** database architecture specified in `docs/docs/DATABASE_DESIGN.md`. Day 9 expands the system across all 7 core domain contexts (IAM, Organization & Staffing, OPD & Scheduling, Clinical EHR, IPD Bed Management, Billing & Claims, Audit & Observability), provides a multi-entity database seeding engine, delivers an interactive live **Database Explorer ("DB View")** in the Admin dashboard, and updates technical documentation.

---

# 1. Executive Summary & Architecture Evolution

Day 9 transitions the platform from single-clinic operations into a fully normalized, scalable **Multi-Tenant Hospital Enterprise Architecture**.

```text
                               ┌────────────────────────────────┐
                               │   Web Portal (Next.js)         │
                               │  - Interactive DB Explorer UI  │
                               │  - Multi-Tenant Admin Views    │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │     API Gateway (NestJS)       │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                              Enterprise API Domain (NestJS)                            │
 ├─────────────────┬──────────────────┬─────────────────┬────────────────┬────────────────┤
 │ IAM & Tenant    │ Org & Staffing   │ OPD Scheduling  │ Clinical EHR   │ IPD & Wards    │
 │ - hospitals     │ - departments    │ - schedules     │ - encounters   │ - wards        │
 │ - branches      │ - doctor_profiles│ - slots         │ - notes (SOAP) │ - beds         │
 │ - user_roles    │ - staff_profiles │ - appointments  │ - prescriptions│ - admissions   │
 ├─────────────────┴──────────────────┴─────────────────┴────────────────┴────────────────┤
 │ Financials, Billing & Claims                        Governance & Observability         │
 │ - invoices & invoice_items                         - audit_logs                        │
 │ - payments                                         - db_explorer endpoints             │
 │ - insurance_claims                                                                     │
 └─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │ PostgreSQL Multi-Tenant Schema  │
                               │ 19 Normalized Tables & Views   │
                               └────────────────────────────────┘
```

---

# 2. 7 Core Domain Contexts Implemented

| Domain Context                         | Managed Entities                                                         | Description                                                                                                      |
| :------------------------------------- | :----------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **1. Identity & Access Control (IAM)** | `hospitals`, `hospital_branches`, `user_roles`, `patient_profiles`       | Multi-tenant organization boundaries, branch definitions, RBAC roles, and patient MRN records.                   |
| **2. Organization & Staffing**         | `departments`, `doctor_profiles`, `doctor_departments`, `staff_profiles` | Clinical & administrative hospital departments, doctor specialties, multi-dept junction, nursing/staff profiles. |
| **3. OPD & Scheduling**                | `doctor_schedules`, `slots`, `appointments`                              | Doctor shift templates, atomic slot locks, OPD appointment lifecycles.                                           |
| **4. Clinical EHR & Diagnostics**      | `encounters`, `medical_notes`, `prescriptions`, `prescription_items`     | Master OPD/IPD encounter tracking, SOAP notes, prescription medication breakdown.                                |
| **5. IPD Wards & Beds**                | `wards`, `beds`, `admissions`                                            | Inpatient wards, real-time bed availability tracking, patient admission & discharge records.                     |
| **6. Billing, Financials & Claims**    | `invoices`, `invoice_items`, `payments`, `insurance_claims`              | Master hospital billing, itemized ledger, multi-method payments, third-party claim tracking.                     |
| **7. Governance & Auditing**           | `audit_logs`, `db-explorer`                                              | Enterprise compliance audit trail, query execution tracking, live database table inspection.                     |

---

# 3. Deliverables Summary

- [x] `docs/docs/day9.md` (This document)
- [x] `docs/docs/day9_plan.md` (Technical Implementation Plan)
- [x] `docs/docs/day9_subtasks.md` (Subtask Matrix)
- [x] Domain TypeORM Entities for all 19 system tables
- [x] Comprehensive database seeder engine populating realistic sample records across all tables
- [x] Database Explorer backend controller & service (`/api/db-explorer/tables`, `/api/db-explorer/tables/:tableName`)
- [x] Interactive Database Explorer frontend dashboard page at `/admin/db-explorer` with table selection, schema summary, live data pagination, and JSON viewer
