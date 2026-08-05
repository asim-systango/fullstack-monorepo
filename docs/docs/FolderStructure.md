# Folder Structure Documentation

```
traning be/
├── docker-compose.yml              # Container orchestration for PostgreSQL, pgAdmin & Redis
├── .env                            # Environment variables for root docker services
│
├── docs/                           # Architectural & Setup Documentation
│   ├── Architecture.md             # System architecture & scalability design
│   ├── FolderStructure.md          # Comprehensive folder & module breakdown
│   └── SetupGuide.md               # Step-by-step developer setup instructions
│
├── backend/                        # NestJS Enterprise API Application
│   ├── .env                        # Backend environment configuration
│   ├── src/
│   │   ├── auth/                   # Passport JWT Auth Module (Controller, Module, Strategies)
│   │   ├── common/                 # Global Shared Utilities
│   │   │   ├── filters/            # Global HTTP Exception Filter
│   │   │   ├── logger/             # HTTP Logging Middleware
│   │   │   ├── pipes/              # Validation Pipes
│   │   │   └── interceptors/       # Response Transform Interceptors
│   │   ├── config/                 # ConfigModule typed namespaces (app, database, redis, auth)
│   │   ├── database/               # Database connection configuration & migrations
│   │   ├── modules/                # Core Business Domain Modules
│   │   │   ├── doctor/             # Doctor entity, controller, module & services
│   │   │   ├── slot/               # Doctor availability slots & schedule rules
│   │   │   ├── appointment/        # Booking lifecycle engine
│   │   │   ├── prescription/       # Patient prescription generation
│   │   │   └── medical-note/       # Clinical consultation notes
│   │   ├── shared/                 # Shared base entities and DTOs
│   │   │   ├── entities/base.entity.ts
│   │   │   └── dto/
│   │   ├── app.module.ts           # Root NestJS Application Module
│   │   └── main.ts                 # Application Bootstrap, ValidationPipe & Swagger UI setup
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                       # Next.js 15 App Router Web Application
    ├── app/                        # Next.js App Router Structure
    │   ├── (auth)/                 # Authentication route group
    │   │   ├── layout.tsx          # Auth container layout
    │   │   └── login/page.tsx      # Sign-in portal page
    │   ├── (dashboard)/            # Protected Dashboard route group
    │   │   ├── layout.tsx          # Dashboard layout with Sidebar & Header
    │   │   ├── dashboard/page.tsx  # Overview metrics page
    │   │   ├── doctors/page.tsx    # Doctor directory page
    │   │   ├── appointments/page.tsx # Appointments management page
    │   │   ├── doctor/schedule/page.tsx # Doctor availability schedule page
    │   │   └── admin/page.tsx      # Admin control center page
    │   ├── (public)/               # Public route group
    │   │   ├── layout.tsx          # Public wrapper layout
    │   │   └── page.tsx            # Landing page
    │   ├── layout.tsx              # Root HTML/Body layout with AppProviders wrapper
    │   └── globals.css             # Tailwind CSS & custom utility directives
    ├── components/                 # Reusable UI Components
    │   ├── header.tsx              # Application Top Header with theme toggle & user badge
    │   ├── sidebar.tsx             # Responsive Sidebar navigation
    │   ├── protected-route.tsx     # Auth gate client component
    │   └── role-route.tsx          # RBAC gate client component
    ├── features/                   # Feature-specific components and hooks
    ├── hooks/                      # Custom React hooks
    ├── lib/                        # Utility classes (cn helper, axios client)
    │   └── utils.ts
    ├── providers/                  # Context providers
    │   ├── app-providers.tsx       # Combined Provider (Redux + Query + Auth)
    │   └── auth-provider.tsx       # Auth State & Token persistence context
    ├── services/                   # API Integration Clients
    │   └── api-client.ts           # Axios instance with request/response interceptors
    ├── store/                      # Redux Toolkit Store
    │   ├── slices/authSlice.ts     # Auth State Redux Slice
    │   └── store.ts                # Redux Store Configuration
    ├── types/                      # TypeScript definitions (User, Doctor, Appointment, Role)
    │   └── index.ts
    ├── tsconfig.json
    └── package.json
```

## Why Each Module & Folder Exists

### Backend Folder Rationale
- `src/common/`: Houses reusable cross-cutting concerns (logging, exception handling, data sanitization) so domain controllers remain pure and focused solely on business logic.
- `src/config/`: Separates application settings from code. Uses environment variables to maintain parity across Development, Staging, and Production environments.
- `src/modules/`: Keeps domain bounded contexts separate. For example, `appointment` code never pollutes `prescription` code, ensuring maintainability and ease of scaling into microservices if required in the future.

### Frontend Folder Rationale
- `app/(group)/`: Utilizes Next.js 15 Route Groups to isolate layouts without polluting the public URL structure.
- `providers/`: Centralized state wrapper keeping `layout.tsx` clean and readable while facilitating SSR and hydration.
- `services/`: Encapsulates network operations using `axios`. Abstracting API calls guarantees that UI components are decoupled from raw HTTP logic.
