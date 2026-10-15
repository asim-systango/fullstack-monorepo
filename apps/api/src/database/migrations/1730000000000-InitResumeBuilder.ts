import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitResumeBuilder1730000000000 implements MigrationInterface {
  name = 'InitResumeBuilder1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "templates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "key" character varying NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_templates_key" UNIQUE ("key"),
        CONSTRAINT "PK_templates" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "resumes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "template_id" uuid NOT NULL,
        "full_name" character varying NOT NULL DEFAULT '',
        "email" character varying NOT NULL DEFAULT '',
        "phone" character varying NOT NULL DEFAULT '',
        "location" character varying NOT NULL DEFAULT '',
        "summary" text NOT NULL DEFAULT '',
        "status" character varying(20) NOT NULL DEFAULT 'draft',
        "slug" character varying,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "UQ_resumes_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_resumes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_resumes_template"
          FOREIGN KEY ("template_id") REFERENCES "templates"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_resumes_owner_id" ON "resumes" ("owner_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "sections" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "resume_id" uuid NOT NULL,
        "type" character varying(32) NOT NULL,
        "title" character varying NOT NULL,
        "position" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_sections" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_sections_position" CHECK ("position" >= 0),
        CONSTRAINT "FK_sections_resume"
          FOREIGN KEY ("resume_id") REFERENCES "resumes"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "section_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "section_id" uuid NOT NULL,
        "heading" character varying NOT NULL DEFAULT '',
        "subheading" character varying NOT NULL DEFAULT '',
        "start_date" character varying NOT NULL DEFAULT '',
        "end_date" character varying NOT NULL DEFAULT '',
        "description" text NOT NULL DEFAULT '',
        "position" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_section_items" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_section_items_position" CHECK ("position" >= 0),
        CONSTRAINT "FK_section_items_section"
          FOREIGN KEY ("section_id") REFERENCES "sections"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "section_items"`);
    await queryRunner.query(`DROP TABLE "sections"`);
    await queryRunner.query(`DROP TABLE "resumes"`);
    await queryRunner.query(`DROP TABLE "templates"`);
  }
}
