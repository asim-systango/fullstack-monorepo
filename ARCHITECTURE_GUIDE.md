# 🚀 Enterprise NestJS + TypeORM Architecture & Coding Guide

This document is a comprehensive, step-by-step master guide for replicating the exact architectural pattern, folder structure, database layer, authentication system, single API design flow, dynamic permissions, and third-party integrations used in this enterprise NestJS application.

---

## 📚 Table of Contents

1. [Overall Folder & Directory Architecture](#1-overall-folder--directory-architecture)
2. [Database Layer: Entities, ULID Keys & Repositories](#2-database-layer-entities-ulid-keys--repositories)
3. [TypeORM Database Migrations & Data Seeding](#3-typeorm-database-migrations--data-seeding)
4. [Master Rule: Single API Step-by-Step Flow](#4-master-rule-single-api-step-by-step-flow)
   - [Step 1: Module Constants (`<feature>.constants.ts`)](#step-1-module-constants-featureconstantsts)
   - [Step 2: Request Payload Validation DTO (`<feature>.dto.ts`)](#step-2-request-payload-validation-dto-featuredtots)
   - [Step 3: Isolated Swagger Decorators (`<feature>.decorator.ts`)](#step-3-isolated-swagger-decorators-featuredecoratorts)
   - [Step 4: Business Logic in Service Layer (`<feature>.service.ts`)](#step-4-business-logic-in-service-layer-featureservicets)
   - [Step 5: Controller & Centralized Exception Mapping (`<feature>.controller.ts`)](#step-5-controller--centralized-exception-mapping-featurecontrollerts)
5. [Feature Module Wiring (`<feature>.module.ts`)](#5-feature-module-wiring-featuremodulets)
6. [Authentication, Security & Guards](#6-authentication-security--guards)
   - [JWT Strategy & `JwtAuthGuard`](#jwt-strategy--jwtauthguard)
   - [Dynamic Route Permission Guard (`RoutePermissionGuard`)](#dynamic-route-permission-guard-routepermissionguard)
   - [Entity Ownership Guard (`HasEntityPermissionGuard`)](#entity-ownership-guard-hasentitypermissionguard)
   - [Blocked User Guard (`BlockedUserGuard`)](#blocked-user-guard-blockeduserguard)
7. [Third-Party Services & Provider Module Architecture](#7-third-party-services--provider-module-architecture)
8. [Global Application Configuration & Bootstrap](#8-global-application-configuration--bootstrap)
9. [Copy-Paste Starter Checklist for New Features](#9-copy-paste-starter-checklist-for-new-features)

---

## 1. Overall Folder & Directory Architecture

Every feature or domain entity lives inside its own dedicated module under `src/modules/`. Database models and core repositories live in `src/database/`. Shared constants, filters, and interceptors live in `src/common/`.

```
src/
├── common/                             # Shared utilities across the app
│   ├── constants/                      # Global constants & message maps
│   ├── enums/                          # Global enums (user.enums.ts, payment.enums.ts)
│   ├── filters/                        # Global Exception Filter (http-exception.filter.ts)
│   └── interceptors/                   # Global Interceptors (audit log, response transform)
├── config/                             # Application configurations
│   └── typeorm.config.ts               # TypeORM DataSource & DB connection setup
├── database/                           # Database Core Infrastructure Layer
│   ├── entities/                       # TypeORM Entity definitions (*.entity.ts)
│   ├── migrations/                     # Schema SQL migrations & seed migrations
│   ├── repositories/                   # Custom repository classes wrapping TypeORM
│   ├── database.module.ts              # Exports all repositories globally
│   └── database.service.ts
├── modules/                            # Feature Modules Directory
│   ├── auth/                           # Authentication & Authorization Module
│   │   ├── constants/
│   │   ├── decorators/swagger/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── services/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   └── auth.module.ts
│   ├── providers/                      # Third-Party External Integration Modules
│   │   ├── aws-s3/                     # File Storage (S3)
│   │   ├── aws-ses/                    # Email Service (SES)
│   │   ├── twilio-sms/                 # SMS & OTP Service
│   │   ├── sumsub/                     # KYC Provider
│   │   ├── comet-chat/                 # Chat Provider
│   │   └── providers.module.ts         # Encapsulated Providers Module
│   └── <feature-name>/                 # Feature Module Structure (e.g. booking, yacht, user)
│       ├── constants/
│       │   └── feature.constants.ts    # Error & Success message constants
│       ├── decorators/
│       │   └── swagger/                # Isolated Swagger Decorators per API endpoint
│       │       └── feature-action.decorator.ts
│       ├── dto/                        # Input Request DTOs with validation rules
│       │   ├── create-feature.dto.ts
│       │   └── update-feature.dto.ts
│       ├── services/                   # Business Logic Layer (NO HTTP Exceptions!)
│       │   └── feature.service.ts
│       ├── feature.controller.ts       # HTTP Controller (Catches errors & maps exceptions)
│       └── feature.module.ts           # NestJS Module Definition
├── app.module.ts                       # Main Root Module
├── main.ts                             # Application Bootstrap Entrypoint
└── load-ssm-env.ts                     # Environmental Parameter Loader
```

---

## 2. Database Layer: Entities, ULID Keys & Repositories

### A. Entity Design Rules

1. **Primary Key**: Always use 26-character **ULID** (`char(26)`). Generate it automatically using TypeORM's `@BeforeInsert()` hook.
2. **Indexing**: Add `@Index()` on foreign keys (`userId`, `roleId`), search fields (`email`), and status columns.
3. **Timestamps**: Store timestamps as Unix Epoch milliseconds (`bigint`).

```typescript
// src/database/entities/booking.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ulid } from 'ulid';
import { User } from './user.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'bookings' })
export class Booking {
  @PrimaryColumn('char', { length: 26 })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid(); // Auto-generates a 26-character sortable ULID
    }
  }

  @Column('char', { length: 26 })
  @Index()
  userId: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Index()
  status: BookingStatus;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  createdAt: number;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  updatedAt: number;
}
```

---

### B. Custom Repository Pattern

Repositories encapsulate all TypeORM database queries (`findOne`, `createQueryBuilder`, `save`, `update`). **Services do not touch TypeORM `Repository<T>` directly.**

```typescript
// src/database/repositories/booking.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  getRepo(): Repository<Booking> {
    return this.bookingRepo;
  }

  async findById(id: string): Promise<Booking | null> {
    return this.bookingRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async createAndSave(data: Partial<Booking>): Promise<Booking> {
    const booking = this.bookingRepo.create(data);
    return this.bookingRepo.save(booking);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    await this.bookingRepo.update(id, {
      status,
      updatedAt: Date.now(),
    });
  }
}
```

---

### C. Database Module Definition

Register all entities and providers in `DatabaseModule` so any feature module can import `DatabaseModule` and inject repositories easily.

```typescript
// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { Booking } from './entities/booking.entity';
import { User } from './entities/user.entity';
import { BookingRepository } from './repositories/booking.repository';
import { UserRepository } from './repositories/users.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Booking, User]),
  ],
  providers: [BookingRepository, UserRepository],
  exports: [BookingRepository, UserRepository],
})
export class DatabaseModule {}
```

---

## 3. TypeORM Database Migrations & Data Seeding

Never use `synchronize: true` in production. Always write TypeORM migrations for schema modifications and database seeders.

### A. Schema Migration (Table & Index Creation)

```typescript
// src/database/migrations/1756447328901-create-bookings-table.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingsTable1756447328901 implements MigrationInterface {
  name = 'CreateBookingsTable1756447328901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" (
        "id" character(26) NOT NULL,
        "userId" character(26) NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'PENDING',
        "createdAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000),
        "updatedAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000),
        CONSTRAINT "PK_bookings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bookings_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bookings_userId" ON "bookings" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_bookings_userId"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
  }
}
```

---

### B. Seed Migration (Initial Roles / Admin User Insertion)

```typescript
// src/database/migrations/1756451676946-seed-roles-migration.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRolesMigration1756451676946 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "roles" ("id", "name", "description") VALUES
       ($1, 'ADMIN',   'Platform Administrator'),
       ($2, 'USER',    'Standard Customer'),
       ($3, 'CAPTAIN', 'Yacht Captain')
       ON CONFLICT ("name") DO NOTHING;`,
      [
        '01K3RG6NZZNHQ3WVCYX6HKYQFY',
        '01K3RG770XFKJGCJ1KVSZW3F82',
        '01K3RG7J9FPJY6E0MS1S5YJEB7',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "roles" WHERE "id" IN ($1, $2, $3);`, [
      '01K3RG6NZZNHQ3WVCYX6HKYQFY',
      '01K3RG770XFKJGCJ1KVSZW3F82',
      '01K3RG7J9FPJY6E0MS1S5YJEB7',
    ]);
  }
}
```

---

## 4. Master Rule: Single API Step-by-Step Flow

Every single API endpoint **MUST** strictly follow this 5-step pipeline:

```
[ HTTP Request ]
       │
       ▼
1. Validation Pipe validates DTO Payload
       │
       ▼
2. Controller handles route & calls Service in try/catch block
       │
       ▼
3. Service executes business logic & calls Repository (Main DB call)
       ├── Failed? Service throws standard `new Error(MODULE_CONSTANTS.ERROR_NAME)`
       └── Success? Service returns plain object / entity
       │
       ▼
4. Controller catches error & matches message in `switch (error.message)`
       └── Throws exact NestJS HttpException (BadRequestException, NotFoundException, etc.)
       │
       ▼
5. Global Filter returns standardized JSON response to client
```

---

### Step 1: Module Constants (`<feature>.constants.ts`)

Centralize all error messages, success messages, and default strings in a constants file. **Never hardcode error strings in services or controllers.**

```typescript
// src/modules/booking/constants/booking.constants.ts
export const BOOKING_ERRORS = {
  BOOKING_NOT_FOUND: 'Booking record not found.',
  USER_NOT_FOUND: 'User account not found.',
  INVALID_AMOUNT: 'Booking amount must be greater than zero.',
  ALREADY_CANCELLED: 'Booking is already cancelled.',
  UNAUTHORIZED_ACCESS: 'You are not authorized to perform this booking action.',
  UNEXPECTED_ERROR: 'An unexpected error occurred during booking processing.',
} as const;

export const BOOKING_MESSAGES = {
  BOOKING_CREATED: 'Booking created successfully.',
  BOOKING_CANCELLED: 'Booking cancelled successfully.',
} as const;
```

---

### Step 2: Request Payload Validation DTO (`<feature>.dto.ts`)

Define validation schemas using `class-validator` and sanitize strings using `class-transformer`. Add `@ApiProperty()` for Swagger documentation.

```typescript
// src/modules/booking/dto/create-booking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: '1500.50',
    description: 'Total booking charter price',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  @IsPositive({ message: 'Booking amount must be a positive number' })
  amount: number;

  @ApiProperty({
    example: '01K3RG770XFKJGCJ1KVSZW3F82',
    description: 'ID of the yacht being booked',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  yachtId: string;
}
```

---

### Step 3: Isolated Swagger Decorators (`<feature>.decorator.ts`)

Instead of putting `@ApiOperation`, `@ApiResponse`, and `@ApiBody` directly on top of controller methods, **extract them into dedicated custom decorator functions** inside `decorators/swagger/`.

```typescript
// src/modules/booking/decorators/swagger/create-booking.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateBookingDto } from '../../dto/create-booking.dto';
import { BOOKING_ERRORS } from '../../constants/booking.constants';

export function CreateBookingSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Create a new booking charter',
      description: 'Allows an authenticated user to initiate a new charter booking.',
    }),
    ApiBody({ type: CreateBookingDto }),
    ApiResponse({
      status: 201,
      description: 'Booking created successfully',
      schema: {
        example: {
          id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
          userId: '01K3RG770XFKJGCJ1KVSZW3F82',
          amount: 1500.5,
          status: 'PENDING',
          createdAt: 1756446803506,
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request / Validation Failure',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/booking',
          error: BOOKING_ERRORS.INVALID_AMOUNT,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'User / Entity Not Found',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/booking',
          error: BOOKING_ERRORS.USER_NOT_FOUND,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/booking',
          error: BOOKING_ERRORS.UNEXPECTED_ERROR,
        },
      },
    }),
  );
}
```

---

### Step 4: Business Logic in Service Layer (`<feature>.service.ts`)

Services perform validation checks, execute business logic, and invoke repositories for DB calls.

🔴 **CRITICAL RULE**: Services **MUST NOT** import or throw NestJS HTTP Exceptions (e.g. `NotFoundException`, `BadRequestException`). They **MUST ONLY throw native JS `new Error(CONSTANTS.KEY)`**.

```typescript
// src/modules/booking/services/booking.service.ts
import { Injectable } from '@nestjs/common';
import { BookingRepository } from '../../../database/repositories/booking.repository';
import { UserRepository } from '../../../database/repositories/users.repository';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BOOKING_ERRORS } from '../constants/booking.constants';
import { Booking, BookingStatus } from '../../../database/entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createBooking(dto: CreateBookingDto, userId: string): Promise<Booking> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(BOOKING_ERRORS.USER_NOT_FOUND);
    }

    if (dto.amount <= 0) {
      throw new Error(BOOKING_ERRORS.INVALID_AMOUNT);
    }

    const now = Date.now();
    return this.bookingRepository.createAndSave({
      userId,
      amount: dto.amount,
      status: BookingStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  async cancelBooking(bookingId: string, userId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error(BOOKING_ERRORS.BOOKING_NOT_FOUND);
    }

    if (booking.userId !== userId) {
      throw new Error(BOOKING_ERRORS.UNAUTHORIZED_ACCESS);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error(BOOKING_ERRORS.ALREADY_CANCELLED);
    }

    await this.bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED);
  }
}
```

---

### Step 5: Controller & Centralized Exception Mapping (`<feature>.controller.ts`)

Controllers handle routing, guards, and Swagger decorators. They wrap service execution in `try/catch` and use `switch(message)` to convert standard JS error messages into exact NestJS HTTP Exceptions.

```typescript
// src/modules/booking/booking.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingService } from './services/booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateBookingSwagger } from './decorators/swagger/create-booking.decorator';
import { BOOKING_ERRORS, BOOKING_MESSAGES } from './constants/booking.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../auth/guards/route-permission.guard';

@ApiTags('Bookings')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @CreateBookingSwagger()
  async createBooking(
    @Body() dto: CreateBookingDto,
    @Req() req: { user: { id: string } },
  ) {
    try {
      return await this.bookingService.createBooking(dto, req.user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Centralized Exception Mapping via Switch/Case
      switch (message) {
        case BOOKING_ERRORS.USER_NOT_FOUND:
          throw new NotFoundException(message);
        case BOOKING_ERRORS.INVALID_AMOUNT:
          throw new BadRequestException(message);
        default:
          console.error('Error in createBooking:', error);
          throw new InternalServerErrorException(BOOKING_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  async cancelBooking(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    try {
      await this.bookingService.cancelBooking(id, req.user.id);
      return { message: BOOKING_MESSAGES.BOOKING_CANCELLED };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case BOOKING_ERRORS.BOOKING_NOT_FOUND:
          throw new NotFoundException(message);
        case BOOKING_ERRORS.UNAUTHORIZED_ACCESS:
          throw new ForbiddenException(message);
        case BOOKING_ERRORS.ALREADY_CANCELLED:
          throw new BadRequestException(message);
        default:
          console.error('Error in cancelBooking:', error);
          throw new InternalServerErrorException(BOOKING_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }
}
```

---

## 5. Feature Module Wiring (`<feature>.module.ts`)

Wire up the controller, service, and database dependencies inside `<feature>.module.ts`.

```typescript
// src/modules/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './services/booking.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule], // Provides BookingRepository & UserRepository
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
```

---

## 6. Authentication, Security & Guards

### A. JWT Strategy & `JwtAuthGuard`

Extracts JWT from `Authorization: Bearer <token>` header, decodes payload, validates against `UserRepository`, and attaches user info to `req.user`.

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../../database/repositories/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.userRepository.findByIdWithRole(payload.sub);
    if (!user || user.isDeleted) {
      throw new UnauthorizedException('Unauthorized Access');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role?.name,
      roleId: user.roleId,
      isActive: user.isActive,
    };
  }
}

// src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

### B. Dynamic Route Permission Guard (`RoutePermissionGuard`)

Dynamically intercepts incoming API calls, retrieves endpoint permission mapping from `route_permissions` table by matching `request.route.path` & `request.method`, and verifies against user permissions.

```typescript
// src/modules/auth/guards/route-permission.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RoutePermissionRepository } from '../../../database/repositories/route-permission.repository';
import { RoleRepository } from '../../../database/repositories/role.repository';

@Injectable()
export class RoutePermissionGuard implements CanActivate {
  constructor(
    private readonly routePermissionRepository: RoutePermissionRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, method, route } = request;

    const path = route?.path;
    const httpMethod = method.toUpperCase();

    // Query database for required permissions for this route & HTTP method
    const routePerm = await this.routePermissionRepository.findByRouteAndMethod(
      path,
      httpMethod,
    );

    // If route doesn't require specific permissions, allow access
    if (!routePerm) return true;

    const requiredPermissionIds: string[] = routePerm.permissionIds;
    const userPermissionIds: string[] =
      await this.roleRepository.getPermissionIdsByRoleId(user.roleId);

    const hasAllPermissions = requiredPermissionIds.every((pid) =>
      userPermissionIds.includes(pid),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'Permission denied: You do not have permission to access this route.',
      );
    }

    return true;
  }
}
```

---

### C. Entity Ownership Guard (`HasEntityPermissionGuard`)

Ensures non-admin users can only access their own resources (e.g. user profile or owned entity).

```typescript
// src/modules/auth/guards/has-profile-permission.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class HasEntityPermissionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const loggedInUser = request.user;
    const params = request.params;

    if (params.userId) {
      const isSelf = loggedInUser?.id === params.userId;
      const isAdmin = loggedInUser?.role === 'ADMIN';

      if (!isAdmin && !isSelf) {
        throw new ForbiddenException('Unauthorized access to user resource');
      }
      return true;
    }
    return true;
  }
}
```

---

### D. Blocked User Guard (`BlockedUserGuard`)

Prevents inactive or blocked users from invoking protected endpoints.

```typescript
// src/modules/auth/guards/blocked-user.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class BlockedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.isActive) {
      throw new ForbiddenException('Account is blocked or inactive.');
    }
    return true;
  }
}
```

---

## 7. Third-Party Services & Provider Module Architecture

Third-party provider integrations (AWS S3, SES, Twilio, Sumsub, Stripe, CometChat) are isolated into independent services inside `src/modules/providers/`.

```
src/modules/providers/
├── aws-s3/             # S3 file upload service
├── aws-ses/            # SES email delivery service
├── twilio-sms/         # Twilio OTP SMS service
├── sumsub/             # KYC Verification service
├── comet-chat/         # Real-time chat service
├── payments/           # Stripe payment integration
└── providers.module.ts # Aggregates and exports all provider services
```

### Provider Module Definition (`providers.module.ts`)

```typescript
// src/modules/providers/providers.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioSmsService } from './twilio-sms/twilio-sms.service';
import { AwsSesService } from './aws-ses/aws-ses.service';

@Module({
  imports: [ConfigModule],
  providers: [TwilioSmsService, AwsSesService],
  exports: [TwilioSmsService, AwsSesService], // Exported for feature modules
})
export class ProvidersModule {}
```

---

## 8. Global Application Configuration & Bootstrap

### Global Exception Filter (`src/common/filters/http-exception.filter.ts`)

Standardizes all HTTP response JSON bodies across the system.

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const resObj =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error.' };

    const errorMessage =
      typeof resObj === 'object' && resObj !== null && 'message' in resObj
        ? (resObj as any).message
        : resObj;

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorMessage,
    });
  }
}
```

---

## 9. Copy-Paste Starter Checklist for New Features

When building a new feature module in any NestJS application following this architecture, complete these 9 steps:

- [ ] **1. Entity**: Add `@Entity('table_name')` in `src/database/entities/` using ULID `char(26)` primary key & `@BeforeInsert()`.
- [ ] **2. Repository**: Create `<feature>.repository.ts` in `src/database/repositories/` and register it inside `DatabaseModule`.
- [ ] **3. Migration**: Write TypeORM SQL migration under `src/database/migrations/` for schema creation & indexes.
- [ ] **4. Constants**: Create `constants/<feature>.constants.ts` with error and success response strings.
- [ ] **5. DTO**: Create `dto/create-<feature>.dto.ts` with `@IsDefined()`, `@IsString()`, `@Transform()`, and `@ApiProperty()`.
- [ ] **6. Swagger Decorators**: Add custom decorator function in `decorators/swagger/` using `applyDecorators()`.
- [ ] **7. Service**: Implement business logic in `services/<feature>.service.ts`. **Only throw `new Error(CONSTANTS.KEY)`**.
- [ ] **8. Controller**: Write endpoint in `<feature>.controller.ts`, attach guards (`@UseGuards(JwtAuthGuard, RoutePermissionGuard)`), wrap in `try/catch`, and handle errors with `switch(message)` throwing NestJS `HttpException`.
- [ ] **9. Module**: Wire controllers and providers inside `<feature>.module.ts` and import `DatabaseModule`.
