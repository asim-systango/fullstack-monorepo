# Hospital Appointment System

# Day 1 — Project Foundation & Architecture

You are a Senior Software Architect with 10+ years of experience building enterprise healthcare systems.

Your goal is NOT to finish the project today.

Your goal is to create a production-ready foundation.

---

# Tech Stack

Backend

- NestJS
- PostgreSQL
- TypeORM
- JWT
- Passport
- Redis (future ready)

Frontend

- Next.js 15
- App Router
- TypeScript
- Tailwind CSS
- ShadCN UI
- TanStack Query
- Redux Toolkit
- React Hook Form
- Zod

Tools

- Docker
- Docker Compose
- ESLint
- Prettier
- Husky
- lint-staged

---

# Today's Goal

Only setup and architecture.

NO business logic.

NO booking implementation.

NO appointment APIs.

---

# Backend Tasks

Create project structure

src/

modules/

doctor/

appointment/

slot/

prescription/

medical-note/

common/

config/

database/

auth/

shared/

Configure

- TypeORM
- PostgreSQL
- Environment Variables
- ValidationPipe
- Global Exception Filter
- Logger
- Swagger
- ConfigModule

Create

Docker Compose

services

postgres

pgadmin

redis

Backend should successfully connect to PostgreSQL.

---

# Frontend Tasks

Create

Next.js 15

Configure

- Tailwind CSS
- ShadCN UI
- ESLint
- Prettier
- Absolute Imports

Create folders

app/

components/

features/

hooks/

services/

store/

providers/

types/

lib/

utils/

Create layouts

Public Layout

Dashboard Layout

Authentication Layout

Create Pages

/

login

dashboard

doctors

appointments

doctor/schedule

admin

Every page should contain placeholder UI.

Use responsive layout.

---

# Authentication Planning

Do NOT implement login.

Only create

Auth Context

API Service

Protected Route

Role Route

Token Storage

Axios Client

---

# Backend Deliverables

✔ NestJS running

✔ PostgreSQL connected

✔ Docker working

✔ Swagger configured

✔ Global Validation configured

✔ Environment variables working

✔ Folder architecture completed

---

# Frontend Deliverables

✔ Next.js running

✔ Tailwind configured

✔ ShadCN installed

✔ Responsive layout

✔ Sidebar

✔ Header

✔ Theme Switch

✔ Placeholder pages

✔ Axios configured

✔ TanStack Query Provider

✔ Redux Provider

---

# Documentation

Generate

Architecture.md

FolderStructure.md

SetupGuide.md

Explain every folder.

Explain why each module exists.

Explain future scalability.

---

# Acceptance Criteria

Backend starts successfully

Frontend starts successfully

Docker works

Swagger opens

Next.js opens

No TypeScript errors

No ESLint errors

No warnings

Everything committed cleanly.

---

Follow Clean Architecture principles.

Write scalable code.

Write production-ready code.

Never use shortcuts.

Always explain why a decision was made.