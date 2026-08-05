# Developer Setup Guide — Monorepo Docker Execution

Welcome to the **Hospital Appointment System** monorepo repository. This guide walks you through building and running the complete enterprise stack (PostgreSQL, pgAdmin, Redis, NestJS Backend, Next.js 15 Frontend) using Docker.

---

## Architecture Overview

```
                          +-------------------------+
                          |   Next.js 15 Frontend   |  (Port 3000)
                          |   (hospital_frontend)   |
                          +-------------------------+
                                       |
                                       v
                          +-------------------------+
                          |   NestJS API Backend    |  (Port 4000)
                          |   (hospital_backend)    |
                          +-------------------------+
                                 /           \
                                v             v
        +--------------------------+       +-----------------------+
        |   PostgreSQL 16 Database |       |   Redis 7 In-Memory   |
        |   (hospital_postgres)    |       |   (hospital_redis)    |
        +--------------------------+       +-----------------------+
                     ^
                     |
        +--------------------------+
        |     pgAdmin 4 Portal     |  (Port 5050)
        |    (hospital_pgadmin)    |
        +--------------------------+
```

---

## Prerequisites

Ensure you have the following installed:
- **Docker Engine & Docker Compose**: `v2.x` or higher
- **Node.js**: `v20.x` or higher (optional, if running outside Docker)

---

## Monorepo Docker Launch (Single Command)

From the monorepo root directory (`/home/ubox136/traning be`):

```bash
# Build & launch all containers (PostgreSQL, pgAdmin, Redis, Backend, Frontend)
docker compose up --build -d

# Check running container statuses
docker ps
```

---

## Service URLs & Endpoints

| Service | Technology | Port / URL | Health Check / Endpoint |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Next.js 15 App Router | `http://localhost:3000` | Landing, Login & Dashboard |
| **Backend REST API** | NestJS | `http://localhost:4000/api/v1` | `http://localhost:4000/api/v1/doctors` |
| **Swagger API Docs** | OpenAPI 3.0 | `http://localhost:4000/api/v1/docs` | Interactive Swagger UI |
| **PostgreSQL DB** | PostgreSQL 16 | `localhost:5433` (Host) | DB: `hospital_db`, User: `postgres` |
| **pgAdmin 4** | Database UI | `http://localhost:5050` | `admin@hospital.com` / `admin123` |
| **Redis Cache** | Redis 7 | `localhost:6379` | In-Memory Cache & Distributed Lock |

---

## Stopping & Resetting the Stack

```bash
# Stop all running containers
docker compose down

# Stop and wipe volumes (Reset Database & Redis state)
docker compose down -v
```
