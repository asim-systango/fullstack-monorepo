# Day 9 Subtask Matrix

| ID        | Task                                                                                             | Component                                    | Status         |
| :-------- | :----------------------------------------------------------------------------------------------- | :------------------------------------------- | :------------- |
| **D9-01** | Create Day 9 Documentation Suite (`day9.md`, `day9_plan.md`, `day9_subtasks.md`)                 | `docs/docs/`                                 | ✅ DONE        |
| **D9-02** | Implement IAM Domain Entities (`Hospital`, `HospitalBranch`, `UserRole`, `PatientProfile`)       | `apps/api/src/modules/`                      | 🚀 IN PROGRESS |
| **D9-03** | Implement Organization & Staffing Entities (`Department`, `StaffProfile`, `DoctorDepartment`)    | `apps/api/src/modules/`                      | 🚀 IN PROGRESS |
| **D9-04** | Implement EHR & IPD Entities (`Encounter`, `Ward`, `Bed`, `Admission`, `PrescriptionItem`)       | `apps/api/src/modules/`                      | 🚀 IN PROGRESS |
| **D9-05** | Implement Billing & Governance Entities (`Invoice`, `InvoiceItem`, `Payment`, `AuditLog`)        | `apps/api/src/modules/`                      | 🚀 IN PROGRESS |
| **D9-06** | Update Existing Entities (`DoctorProfile`, `Slot`, `Appointment`, `Prescription`, `MedicalNote`) | `apps/api/src/modules/`                      | 🚀 IN PROGRESS |
| **D9-07** | Create DB Seeding Engine populating all 19 entities                                              | `apps/api/src/database/seed.ts`              | 🚀 IN PROGRESS |
| **D9-08** | Create API DbExplorerModule (`GET /api/db-explorer/tables`)                                      | `apps/api/src/modules/db-explorer`           | 🚀 IN PROGRESS |
| **D9-09** | Build Web DB Explorer Page & Viewer Modal (`/admin/db-explorer`)                                 | `apps/web/app/(dashboard)/admin/db-explorer` | 🚀 IN PROGRESS |
| **D9-10** | Add DB Explorer Navigation link in Admin Dashboard                                               | `apps/web/app/(dashboard)/admin`             | 🚀 IN PROGRESS |
| **D9-11** | Verify `typecheck`, `lint`, and `seed` execution                                                 | Monorepo CI                                  | 🚀 IN PROGRESS |
