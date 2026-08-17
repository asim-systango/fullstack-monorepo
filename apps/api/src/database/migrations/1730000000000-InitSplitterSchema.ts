import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSplitterSchema1730000000000 implements MigrationInterface {
  name = 'InitSplitterSchema1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsers = await queryRunner.hasTable('users');

    if (!hasUsers) {
      await queryRunner.query(`
        CREATE TABLE "users" (
          "id" uuid NOT NULL DEFAULT gen_random_uuid(),
          "email" character varying NOT NULL,
          "password_hash" character varying NOT NULL,
          "name" character varying NOT NULL,
          "role" character varying(20) NOT NULL DEFAULT 'user',
          "email_verified_at" TIMESTAMPTZ,
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_users_email" UNIQUE ("email"),
          CONSTRAINT "CHK_users_role" CHECK ("role" IN ('admin', 'user', 'staff')),
          CONSTRAINT "PK_users" PRIMARY KEY ("id")
        )
      `);
    } else {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMPTZ
      `);
    }

    await queryRunner.query(`
      CREATE TABLE "email_verification_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(255) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "used_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_verification_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_email_verification_tokens_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_email_verification_tokens_user_id"
        ON "email_verification_tokens" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_email_verification_tokens_token_hash"
        ON "email_verification_tokens" ("token_hash")
    `);

    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(255) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "used_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_password_reset_tokens_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_password_reset_tokens_user_id"
        ON "password_reset_tokens" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_password_reset_tokens_token_hash"
        ON "password_reset_tokens" ("token_hash")
    `);

    await queryRunner.query(`
      CREATE TABLE "groups" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "created_by_user_id" uuid NOT NULL,
        "blocked_at" TIMESTAMPTZ,
        "blocked_by_user_id" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_groups" PRIMARY KEY ("id"),
        CONSTRAINT "FK_groups_created_by" FOREIGN KEY ("created_by_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_groups_blocked_by" FOREIGN KEY ("blocked_by_user_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_groups_created_by_user_id" ON "groups" ("created_by_user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_groups_blocked_at" ON "groups" ("blocked_at")
        WHERE "blocked_at" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "group_members" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "group_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" character varying(20) NOT NULL,
        "joined_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_group_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_group_members_group_user" UNIQUE ("group_id", "user_id"),
        CONSTRAINT "CHK_group_members_role" CHECK ("role" IN ('admin', 'member')),
        CONSTRAINT "FK_group_members_group" FOREIGN KEY ("group_id")
          REFERENCES "groups"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_group_members_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_group_members_user_id" ON "group_members" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_group_members_group_id" ON "group_members" ("group_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "group_invitations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "group_id" uuid NOT NULL,
        "invited_by_user_id" uuid NOT NULL,
        "invitee_email" character varying(255) NOT NULL,
        "invitee_user_id" uuid,
        "invite_token_hash" character varying(255) NOT NULL,
        "status" character varying(20) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "responded_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_group_invitations" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_group_invitations_status"
          CHECK ("status" IN ('pending', 'accepted', 'declined', 'expired')),
        CONSTRAINT "FK_group_invitations_group" FOREIGN KEY ("group_id")
          REFERENCES "groups"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_group_invitations_invited_by" FOREIGN KEY ("invited_by_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_group_invitations_invitee_user" FOREIGN KEY ("invitee_user_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_group_invitations_pending_email"
        ON "group_invitations" ("group_id", "invitee_email")
        WHERE "status" = 'pending'
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_group_invitations_invitee_email"
        ON "group_invitations" ("invitee_email")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_group_invitations_invitee_user_id"
        ON "group_invitations" ("invitee_user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_group_invitations_pending_email"
        ON "group_invitations" ("invitee_email")
        WHERE "status" = 'pending'
    `);

    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "group_id" uuid NOT NULL,
        "payer_user_id" uuid NOT NULL,
        "created_by_user_id" uuid NOT NULL,
        "description" character varying(500) NOT NULL,
        "amount_cents" integer NOT NULL,
        "category" character varying(100),
        "expense_date" TIMESTAMPTZ NOT NULL,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by_user_id" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expenses" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_expenses_amount" CHECK ("amount_cents" > 0),
        CONSTRAINT "FK_expenses_group" FOREIGN KEY ("group_id")
          REFERENCES "groups"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_expenses_payer" FOREIGN KEY ("payer_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_expenses_created_by" FOREIGN KEY ("created_by_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_expenses_deleted_by" FOREIGN KEY ("deleted_by_user_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_expenses_group_id" ON "expenses" ("group_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_expenses_payer_user_id" ON "expenses" ("payer_user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_expenses_expense_date" ON "expenses" ("expense_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_expenses_created_by_user_id" ON "expenses" ("created_by_user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_expenses_group_active_date"
        ON "expenses" ("group_id", "expense_date" DESC)
        WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "shares" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "expense_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "amount_cents" integer NOT NULL,
        CONSTRAINT "PK_shares" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_shares_expense_user" UNIQUE ("expense_id", "user_id"),
        CONSTRAINT "CHK_shares_amount" CHECK ("amount_cents" >= 0),
        CONSTRAINT "FK_shares_expense" FOREIGN KEY ("expense_id")
          REFERENCES "expenses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_shares_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_shares_expense_id" ON "shares" ("expense_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_shares_user_id" ON "shares" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "settlements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "group_id" uuid NOT NULL,
        "payer_user_id" uuid NOT NULL,
        "payee_user_id" uuid NOT NULL,
        "created_by_user_id" uuid NOT NULL,
        "amount_cents" integer NOT NULL,
        "note" character varying(500),
        "settled_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_settlements" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_settlements_amount" CHECK ("amount_cents" > 0),
        CONSTRAINT "CHK_settlements_distinct_users" CHECK ("payer_user_id" <> "payee_user_id"),
        CONSTRAINT "FK_settlements_group" FOREIGN KEY ("group_id")
          REFERENCES "groups"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_settlements_payer" FOREIGN KEY ("payer_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_settlements_payee" FOREIGN KEY ("payee_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_settlements_created_by" FOREIGN KEY ("created_by_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_settlements_group_id" ON "settlements" ("group_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "settlements"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shares"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "expenses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "group_invitations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "group_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "groups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "email_verification_tokens"`);
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified_at"
    `);
  }
}
