# Job Portal — Cloudinary Signed Resume Upload Report

Backend never receives file bytes. Browser uploads directly to Cloudinary using a
signature from `POST /resumes/upload-signature`.

---

## Env vars you must fill in

Add/fill these in **`apps/api/.env`** (placeholders are already in `.env.example`):

| Variable                | Where to get it                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDINARY_CLOUD_NAME` | [Cloudinary Console](https://console.cloudinary.com/) → **Settings** → **Product Environment Settings** → **API Keys** → **Cloud name** |
| `CLOUDINARY_API_KEY`    | Same page → **API Key** (public; also returned to the frontend in the signature payload)                                                |
| `CLOUDINARY_API_SECRET` | Same page → **API Secret** (click to reveal). **Never** send this to the browser or commit it.                                          |

The API Zod schema (`libs/env/src/api`) requires all three at boot — empty values fail loudly, same pattern as `JWT_SECRET`.

Then run:

```bash
pnpm migration:run:api
pnpm --filter @shared/env build   # if not already rebuilt after pull
pnpm dev:api
```

---

## Example curls

### 1) Get a signed upload payload (real curl via gateway)

```bash
# Login as candidate and keep the cookie
curl -sS -c cookies.txt -H 'Content-Type: application/json' \
  -d '{"email":"user@demo.local","password":"password123"}' \
  http://localhost:3001/auth/login

# Ask the backend for a Cloudinary upload signature (no body)
curl -sS -b cookies.txt -X POST http://localhost:3001/resumes/upload-signature
# → { "data": { "signature", "timestamp", "apiKey", "cloudName", "folder" } }
```

### 2) Frontend direct-to-Cloudinary upload (illustrative — runs in the browser)

```bash
# NOT a working copy-paste curl for your laptop — this is what the browser does
# after POST /resumes/upload-signature returns { signature, timestamp, apiKey, cloudName, folder }.
#
# curl -X POST "https://api.cloudinary.com/v1_1/${cloudName}/raw/upload" \
#   -F "file=@/path/to/resume.pdf" \
#   -F "api_key=${apiKey}" \
#   -F "timestamp=${timestamp}" \
#   -F "signature=${signature}" \
#   -F "folder=${folder}"
#
# Cloudinary responds with secure_url + public_id. Then save the ResumeMeta row:
#
# curl -b cookies.txt -H 'Content-Type: application/json' \
#   -d '{"url":"<secure_url>","label":"Primary CV","cloudinaryPublicId":"<public_id>"}' \
#   http://localhost:3001/resumes
```

Use `resource_type=raw` (`/raw/upload`) for PDFs.

---

## Files created / modified

### `libs/env/src/api/index.ts`

**Status:** modified

**One-line summary:** Require CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET via Zod at boot.

```ts
import { z } from 'zod';
import { nodeEnv } from '../node-env';

/** Internal domain API (`apps/api`) — Bearer JWT only, no browser cookies. */
export const apiEnvSchema = z.object({
  NODE_ENV: nodeEnv,
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  // Required for signed resume uploads — fail at boot if unset (same as JWT_SECRET).
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function loadApiEnv(
  env: Record<string, string | undefined> = process.env,
): ApiEnv {
  const parsed = apiEnvSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid API environment:\n${details}`);
  }
  return parsed.data;
}
```

### `apps/api/.env.example`

**Status:** modified

**One-line summary:** Document Cloudinary placeholder env keys (no real secrets).

```env
# Internal Nest domain API — copy to apps/api/.env
# Prefer this file over repo-root .env (load-env picks the first existing file; no merge).
# Browser traffic should hit apps/api-gateway (:3001), not this port.
# JWT_SECRET must match apps/api-gateway/.env. Canonical PORT is 3002 (keep gateway API_UPSTREAM_URL in sync if changed).
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/app
JWT_SECRET=dev-jwt-secret-min-16chars

# Cloudinary (Dashboard → Settings → Product Environment Settings → API Keys)
# Fill real values in apps/api/.env — never commit secrets.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### `apps/api/src/modules/resume-meta/cloudinary.service.ts`

**Status:** created

```ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { loadApiEnv } from '../../common/env';

export type UploadSignaturePayload = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);
  private cloudName!: string;
  private apiKey!: string;
  // Kept private — never returned from generateUploadSignature or any HTTP response.
  private apiSecret!: string;

  onModuleInit() {
    // loadApiEnv already throws if any Cloudinary key is missing (Zod, same as JWT_SECRET).
    const env = loadApiEnv();
    this.cloudName = env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = env.CLOUDINARY_API_KEY;
    this.apiSecret = env.CLOUDINARY_API_SECRET;
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });
    this.logger.log('Cloudinary SDK configured for signed resume uploads');
  }

  generateUploadSignature(candidateUserId: string): UploadSignaturePayload {
    // Namespace each candidate so signed uploads cannot write into another user's folder.
    const folder = `resumes/${candidateUserId}`;
    const timestamp = Math.round(Date.now() / 1000);
    // Sign only the params the browser will POST — never include api_secret in the payload.
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      this.apiSecret,
    );

    return {
      signature,
      timestamp,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder,
    };
  }

  async deleteAsset(publicId: string): Promise<void> {
    // PDFs uploaded as "raw" must be destroyed with resource_type: 'raw'.
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  }
}
```

### `apps/api/src/modules/resume-meta/resume-meta.entity.ts`

**Status:** modified

**One-line summary:** Added nullable cloudinaryPublicId column mapping.

```ts
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'resume_metas' })
export class ResumeMeta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Cross-service candidate ref — no FK to users (different service/database).
  @Index()
  @Column({ name: 'candidate_user_id' })
  candidateUserId!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  label?: string;

  // Cloudinary public_id from direct browser upload — used to destroy the raw asset on delete.
  @Column({ name: 'cloudinary_public_id', nullable: true })
  cloudinaryPublicId?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
```

### `apps/api/src/modules/resume-meta/dto/create-resume-meta.dto.ts`

**Status:** modified

**One-line summary:** Accept optional cloudinaryPublicId from client after direct upload.

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateResumeMetaDto {
  @ApiProperty()
  @IsUrl()
  url!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label?: string;

  // Optional: Cloudinary public_id returned after direct signed upload (not a live FK).
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  cloudinaryPublicId?: string;
}
```

### `apps/api/src/modules/resume-meta/resume-meta.service.ts`

**Status:** modified

**One-line summary:** Inject CloudinaryService; destroy raw asset on remove when public_id present.

```ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary.service';
import { ResumeMeta } from './resume-meta.entity';
import { CreateResumeMetaDto } from './dto/create-resume-meta.dto';
import { UpdateResumeMetaDto } from './dto/update-resume-meta.dto';

@Injectable()
export class ResumeMetaService {
  constructor(
    @InjectRepository(ResumeMeta)
    private readonly resumeMetaRepo: Repository<ResumeMeta>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  create(candidateUserId: string, dto: CreateResumeMetaDto) {
    const resume = this.resumeMetaRepo.create({ ...dto, candidateUserId });
    return this.resumeMetaRepo.save(resume);
  }

  findMine(candidateUserId: string) {
    return this.resumeMetaRepo.find({
      where: { candidateUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOwnedOrThrow(id: string, candidateUserId: string) {
    const resume = await this.resumeMetaRepo.findOne({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    // Ownership check lives here because this method already loads the row.
    if (resume.candidateUserId !== candidateUserId) {
      throw new ForbiddenException('You do not own this resume');
    }
    return resume;
  }

  async update(id: string, candidateUserId: string, dto: UpdateResumeMetaDto) {
    const resume = await this.findOwnedOrThrow(id, candidateUserId);
    Object.assign(resume, dto);
    return this.resumeMetaRepo.save(resume);
  }

  async remove(id: string, candidateUserId: string) {
    const resume = await this.findOwnedOrThrow(id, candidateUserId);
    // Pasted-URL resumes have no remote asset; Cloudinary uploads store public_id for destroy.
    if (resume.cloudinaryPublicId) {
      await this.cloudinaryService.deleteAsset(resume.cloudinaryPublicId);
    }
    await this.resumeMetaRepo.remove(resume);
    return { ok: true };
  }
}
```

### `apps/api/src/modules/resume-meta/resume-meta.controller.ts`

**Status:** modified

**One-line summary:** Added POST /resumes/upload-signature; existing CRUD unchanged.

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  type JwtUser,
} from '../../common/auth';
import { CloudinaryService } from './cloudinary.service';
import { ResumeMetaService } from './resume-meta.service';
import { CreateResumeMetaDto } from './dto/create-resume-meta.dto';
import { UpdateResumeMetaDto } from './dto/update-resume-meta.dto';

@ApiTags('resumes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resumes')
export class ResumeMetaController {
  constructor(
    private readonly resumeMetaService: ResumeMetaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Declared before :id routes for clarity — POST path does not collide with GET :id.
  @Roles('user')
  @Post('upload-signature')
  uploadSignature(@CurrentUser() user: JwtUser) {
    return this.cloudinaryService.generateUploadSignature(user.id);
  }

  @Roles('user')
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateResumeMetaDto) {
    return this.resumeMetaService.create(user.id, dto);
  }

  @Roles('user')
  @Get()
  findMine(@CurrentUser() user: JwtUser) {
    return this.resumeMetaService.findMine(user.id);
  }

  @Roles('user')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.resumeMetaService.findOwnedOrThrow(id, user.id);
  }

  @Roles('user')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateResumeMetaDto,
  ) {
    return this.resumeMetaService.update(id, user.id, dto);
  }

  @Roles('user')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.resumeMetaService.remove(id, user.id);
  }
}
```

### `apps/api/src/modules/resume-meta/resume-meta.module.ts`

**Status:** modified

**One-line summary:** Register CloudinaryService provider.

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from './cloudinary.service';
import { ResumeMeta } from './resume-meta.entity';
import { ResumeMetaController } from './resume-meta.controller';
import { ResumeMetaService } from './resume-meta.service';

@Module({
  imports: [TypeOrmModule.forFeature([ResumeMeta])],
  controllers: [ResumeMetaController],
  providers: [ResumeMetaService, CloudinaryService],
  exports: [ResumeMetaService],
})
export class ResumeMetaModule {}
```

### `apps/api/src/database/migrations/1786800000001-AddResumeMetaCloudinaryPublicId.ts`

**Status:** created

```ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResumeMetaCloudinaryPublicId1786800000001 implements MigrationInterface {
  name = 'AddResumeMetaCloudinaryPublicId1786800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resume_metas" ADD "cloudinary_public_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resume_metas" DROP COLUMN "cloudinary_public_id"`,
    );
  }
}
```

### `apps/api/package.json`

**Status:** modified

**One-line summary:** Added cloudinary dependency.

```json
{
  "name": "@app/api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main.js",
    "lint": "eslint \"src/**/*.ts\"",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "pnpm typeorm migration:generate -d src/database/data-source.ts",
    "migration:run": "pnpm typeorm migration:run -d src/database/data-source.ts",
    "migration:revert": "pnpm typeorm migration:revert -d src/database/data-source.ts",
    "seed": "ts-node -r tsconfig-paths/register src/database/seed.ts",
    "test": "jest --config ../../jest.config.cjs --testPathPattern=apps/api/src"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.12",
    "@nestjs/core": "^11.0.12",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^11.0.12",
    "@nestjs/swagger": "^11.1.1",
    "@nestjs/typeorm": "^11.0.0",
    "@shared/env": "workspace:*",
    "@shared/http": "workspace:*",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "cloudinary": "^2.10.0",
    "compression": "^1.8.1",
    "cookie-parser": "^1.4.7",
    "dotenv": "^16.4.7",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.14.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.2",
    "typeorm": "^0.3.21"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.6",
    "@nestjs/testing": "^11.0.12",
    "@shared/config": "workspace:*",
    "@types/compression": "^1.8.1",
    "@types/cookie-parser": "^1.4.10",
    "@types/express": "^5.0.1",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.13.11",
    "@types/passport-jwt": "^4.0.1",
    "eslint": "^9.22.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.3.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.26.1"
  }
}
```
