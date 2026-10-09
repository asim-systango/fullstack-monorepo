import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIssues1786793902620 implements MigrationInterface {
  name = 'CreateIssues1786793902620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "labels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "name" character varying NOT NULL, "color" character varying NOT NULL DEFAULT '#888888', CONSTRAINT "uq_label_name" UNIQUE ("project_id", "name"), CONSTRAINT "PK_c0c4e97f76f1f3a268c7a70b925" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "issues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL DEFAULT '', "status" character varying(20) NOT NULL DEFAULT 'todo', "assignee_id" uuid, "sprint_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "CHK_cd0df47d04344922ecaadae404" CHECK ("status" IN ('todo', 'in_progress', 'done')), CONSTRAINT "PK_9d8ecbbeff46229c700f0449257" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_11f35e8296e10c229e7b68c68d" ON "issues" ("project_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "issue_labels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issue_id" uuid NOT NULL, "label_id" uuid NOT NULL, CONSTRAINT "uq_issue_label" UNIQUE ("issue_id", "label_id"), CONSTRAINT "PK_1f49c5ca64fbef160746aba539a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issue_id" uuid NOT NULL, "author_id" uuid NOT NULL, "body" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4ce924bcd63bee0fccc7fe1d8f" ON "comments" ("issue_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issue_id" uuid NOT NULL, "user_id" uuid NOT NULL, "from_status" character varying(20), "to_status" character varying(20) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_95559b42765291b930129dfa39" ON "activity_logs" ("issue_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_95559b42765291b930129dfa39"`);
    await queryRunner.query(`DROP TABLE "activity_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4ce924bcd63bee0fccc7fe1d8f"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "issue_labels"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_11f35e8296e10c229e7b68c68d"`);
    await queryRunner.query(`DROP TABLE "issues"`);
    await queryRunner.query(`DROP TABLE "labels"`);
  }
}
