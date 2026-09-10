import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialEventManagementTables1788944607563 implements MigrationInterface {
    name = 'InitialEventManagementTables1788944607563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "check_ins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticketId" uuid NOT NULL, "scannedByUserId" uuid NOT NULL, "scannedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fac7f27bc829a454ad477c13f62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a58947aa4999755168d6d351ba" ON "check_ins" ("ticketId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ebe1ec544f4ef3d7b361f17367" ON "check_ins" ("scannedByUserId") `);
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('ISSUED', 'USED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rsvpId" uuid NOT NULL, "eventId" uuid NOT NULL, "userId" uuid NOT NULL, "qrPayload" character varying(255) NOT NULL, "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'ISSUED', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8ae244692fa83b53ef9d17c7095" UNIQUE ("rsvpId"), CONSTRAINT "UQ_5ffd1aa1a83f2686715f8f376dc" UNIQUE ("qrPayload"), CONSTRAINT "REL_8ae244692fa83b53ef9d17c709" UNIQUE ("rsvpId"), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8ae244692fa83b53ef9d17c709" ON "tickets" ("rsvpId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8a101375d173c39a7c1d02c9d7" ON "tickets" ("eventId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4bb45e096f521845765f657f5c" ON "tickets" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5ffd1aa1a83f2686715f8f376d" ON "tickets" ("qrPayload") `);
        await queryRunner.query(`CREATE TYPE "public"."rsvps_status_enum" AS ENUM('YES', 'NO', 'MAYBE')`);
        await queryRunner.query(`CREATE TABLE "rsvps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventId" uuid NOT NULL, "userId" uuid NOT NULL, "status" "public"."rsvps_status_enum" NOT NULL DEFAULT 'YES', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c9781419fb66d5682f570622dc9" UNIQUE ("eventId", "userId"), CONSTRAINT "PK_5d5dda5a5f9fc2f6ba17eefbf86" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_91d2247e228885740f0e6f427b" ON "rsvps" ("eventId") `);
        await queryRunner.query(`CREATE INDEX "IDX_162d129ecc40a05c5558dbc794" ON "rsvps" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text NOT NULL, "location" character varying(255) NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "capacity" integer NOT NULL DEFAULT '50', "organizerId" uuid NOT NULL, "status" "public"."events_status_enum" NOT NULL DEFAULT 'PUBLISHED', "category" character varying(100) NOT NULL DEFAULT 'General', "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1024d476207981d1c72232cf3c" ON "events" ("organizerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f20503eb78cfdac5f8eda342c8" ON "events" ("category") `);
        await queryRunner.query(`CREATE TYPE "public"."waitlist_entries_status_enum" AS ENUM('WAITING', 'PROMOTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "waitlist_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventId" uuid NOT NULL, "userId" uuid NOT NULL, "position" integer NOT NULL DEFAULT '1', "status" "public"."waitlist_entries_status_enum" NOT NULL DEFAULT 'WAITING', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bd0ef66fff81d3be7b7a1568a4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cc5689522e3be0198d8b3af1af" ON "waitlist_entries" ("eventId") `);
        await queryRunner.query(`CREATE INDEX "IDX_57642f3d0efcd6958d2a689a79" ON "waitlist_entries" ("userId") `);
        await queryRunner.query(`ALTER TABLE "check_ins" ADD CONSTRAINT "FK_a58947aa4999755168d6d351baa" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_8ae244692fa83b53ef9d17c7095" FOREIGN KEY ("rsvpId") REFERENCES "rsvps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_8a101375d173c39a7c1d02c9d7d" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rsvps" ADD CONSTRAINT "FK_91d2247e228885740f0e6f427ba" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "waitlist_entries" ADD CONSTRAINT "FK_cc5689522e3be0198d8b3af1af7" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "waitlist_entries" DROP CONSTRAINT "FK_cc5689522e3be0198d8b3af1af7"`);
        await queryRunner.query(`ALTER TABLE "rsvps" DROP CONSTRAINT "FK_91d2247e228885740f0e6f427ba"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_8a101375d173c39a7c1d02c9d7d"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_8ae244692fa83b53ef9d17c7095"`);
        await queryRunner.query(`ALTER TABLE "check_ins" DROP CONSTRAINT "FK_a58947aa4999755168d6d351baa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57642f3d0efcd6958d2a689a79"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cc5689522e3be0198d8b3af1af"`);
        await queryRunner.query(`DROP TABLE "waitlist_entries"`);
        await queryRunner.query(`DROP TYPE "public"."waitlist_entries_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f20503eb78cfdac5f8eda342c8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1024d476207981d1c72232cf3c"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_162d129ecc40a05c5558dbc794"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91d2247e228885740f0e6f427b"`);
        await queryRunner.query(`DROP TABLE "rsvps"`);
        await queryRunner.query(`DROP TYPE "public"."rsvps_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5ffd1aa1a83f2686715f8f376d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4bb45e096f521845765f657f5c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a101375d173c39a7c1d02c9d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8ae244692fa83b53ef9d17c709"`);
        await queryRunner.query(`DROP TABLE "tickets"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ebe1ec544f4ef3d7b361f17367"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a58947aa4999755168d6d351ba"`);
        await queryRunner.query(`DROP TABLE "check_ins"`);
    }

}
