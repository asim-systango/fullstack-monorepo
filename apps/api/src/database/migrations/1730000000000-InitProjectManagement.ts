import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitProjectManagement1730000000000 implements MigrationInterface {
  name = 'InitProjectManagement1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(120) NOT NULL,
        "key" character varying(16) NOT NULL,
        "created_by_user_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "project_members" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" character varying(20) NOT NULL DEFAULT 'member',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_project_members_project_user" UNIQUE ("project_id", "user_id"),
        CONSTRAINT "FK_project_members_project"
          FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "labels" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "name" character varying(60) NOT NULL,
        "color" character varying(20) NOT NULL DEFAULT '#64748b',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_labels" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_labels_project_name" UNIQUE ("project_id", "name"),
        CONSTRAINT "FK_labels_project"
          FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "issues" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "title" character varying(200) NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "status" character varying(20) NOT NULL DEFAULT 'todo',
        "assignee_id" uuid,
        "reporter_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_issues" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_issues_status" CHECK ("status" IN ('todo', 'in_progress', 'done')),
        CONSTRAINT "FK_issues_project"
          FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_issues_project_status" ON "issues" ("project_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_issues_deleted_at" ON "issues" ("deleted_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "issue_labels" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "issue_id" uuid NOT NULL,
        "label_id" uuid NOT NULL,
        CONSTRAINT "PK_issue_labels" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_issue_labels_issue_label" UNIQUE ("issue_id", "label_id"),
        CONSTRAINT "FK_issue_labels_issue"
          FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_issue_labels_label"
          FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "issue_id" uuid NOT NULL,
        "author_user_id" uuid NOT NULL,
        "body" text NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_issue"
          FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "activity_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "issue_id" uuid NOT NULL,
        "actor_user_id" uuid NOT NULL,
        "type" character varying(40) NOT NULL,
        "message" text NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activity_logs_issue"
          FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "issue_labels"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "issues"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "labels"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
  }
}
