import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupportDeskSchema1720000000001 implements MigrationInterface {
  name = 'CreateSupportDeskSchema1720000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(100) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
      )
    `);

    // 2. SLA Policies table
    await queryRunner.query(`
      CREATE TABLE "sla_policies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "category_id" uuid NOT NULL,
        "priority" varchar(20) NOT NULL DEFAULT 'medium',
        "first_response_hours" integer NOT NULL DEFAULT 24,
        "resolution_hours" integer NOT NULL DEFAULT 72,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sla_policies" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sla_category_priority" UNIQUE ("category_id", "priority"),
        CONSTRAINT "CK_sla_priority" CHECK ("priority" IN ('low', 'medium', 'high', 'urgent')),
        CONSTRAINT "FK_sla_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
      )
    `);

    // 3. Tickets table
    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ticket_number" bigint GENERATED ALWAYS AS IDENTITY,
        "subject" varchar(255) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'open',
        "priority" varchar(20) NOT NULL DEFAULT 'medium',
        "category_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "assignee_id" uuid,
        "version" integer NOT NULL DEFAULT 1,
        "first_response_due_at" TIMESTAMPTZ,
        "first_response_at" TIMESTAMPTZ,
        "resolution_due_at" TIMESTAMPTZ,
        "resolved_at" TIMESTAMPTZ,
        "closed_at" TIMESTAMPTZ,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "search_vector" tsvector,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tickets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tickets_ticket_number" UNIQUE ("ticket_number"),
        CONSTRAINT "CK_tickets_status" CHECK ("status" IN ('open', 'pending', 'resolved', 'closed')),
        CONSTRAINT "CK_tickets_priority" CHECK ("priority" IN ('low', 'medium', 'high', 'urgent')),
        CONSTRAINT "FK_tickets_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT
      )
    `);

    // 4. Ticket Events table (Audit Ledger)
    await queryRunner.query(`
      CREATE TABLE "ticket_events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ticket_id" uuid NOT NULL,
        "actor_id" uuid NOT NULL,
        "event_type" varchar(50) NOT NULL,
        "old_value" jsonb,
        "new_value" jsonb,
        "reason" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ticket_events_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE
      )
    `);

    // 5. Messages table
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ticket_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "message_type" varchar(20) NOT NULL DEFAULT 'public',
        "body" text NOT NULL,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "search_vector" tsvector,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id"),
        CONSTRAINT "CK_messages_type" CHECK ("message_type" IN ('public', 'internal_note', 'system_event')),
        CONSTRAINT "FK_messages_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE
      )
    `);

    // 6. Attachments table
    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "message_id" uuid NOT NULL,
        "url" varchar(1024) NOT NULL,
        "filename" varchar(255) NOT NULL,
        "mime_type" varchar(100) NOT NULL,
        "size_bytes" bigint NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attachments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_attachments_message" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE
      )
    `);

    // 7. Tags table & TicketTags junction
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(50) NOT NULL,
        "color_hex" varchar(7) NOT NULL DEFAULT '#6B7280',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tags" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tags_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ticket_tags" (
        "ticket_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_tags" PRIMARY KEY ("ticket_id", "tag_id"),
        CONSTRAINT "FK_ticket_tags_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
      )
    `);

    // 8. Notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "ticket_id" uuid NOT NULL,
        "type" varchar(50) NOT NULL,
        "title" varchar(255) NOT NULL,
        "body" text,
        "read_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE
      )
    `);

    // 9. Outbox Events table
    await queryRunner.query(`
      CREATE TABLE "outbox_events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "aggregate_type" varchar(50) NOT NULL DEFAULT 'TICKET',
        "aggregate_id" uuid NOT NULL,
        "event_type" varchar(100) NOT NULL,
        "payload" jsonb NOT NULL,
        "processed_at" TIMESTAMPTZ,
        "retry_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_outbox_events" PRIMARY KEY ("id")
      )
    `);

    // 10. Indexes & Full-Text Search triggers
    await queryRunner.query(`
      CREATE INDEX "idx_tickets_active_inbox" ON "tickets" ("assignee_id", "status", "priority", "created_at" DESC) WHERE "deleted_at" IS NULL;
      CREATE INDEX "idx_tickets_user_id" ON "tickets" ("user_id") WHERE "deleted_at" IS NULL;
      CREATE INDEX "idx_tickets_sla_breach" ON "tickets" ("first_response_due_at") WHERE "first_response_at" IS NULL AND "deleted_at" IS NULL;
      CREATE INDEX "idx_messages_ticket_thread" ON "messages" ("ticket_id", "created_at" ASC);
      CREATE INDEX "idx_outbox_unprocessed" ON "outbox_events" ("created_at" ASC) WHERE "processed_at" IS NULL;
      CREATE INDEX "idx_tickets_search" ON "tickets" USING GIN ("search_vector");
      CREATE INDEX "idx_messages_search" ON "messages" USING GIN ("search_vector");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "outbox_events" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_tags" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attachments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_events" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tickets" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sla_policies" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories" CASCADE`);
  }
}
