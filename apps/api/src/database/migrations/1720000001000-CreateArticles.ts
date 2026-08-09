import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticles1720000001000 implements MigrationInterface {
  name = 'CreateArticles1720000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // published_revision_id FK is added in CreateRevisions (circular dependency).
    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "author_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "published_revision_id" uuid,
        "published_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_articles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_articles_slug" UNIQUE ("slug"),
        CONSTRAINT "CHK_articles_published_pair" CHECK (
          (
            "published_revision_id" IS NULL
            AND "published_at" IS NULL
          )
          OR (
            "published_revision_id" IS NOT NULL
            AND "published_at" IS NOT NULL
          )
        )
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_articles_author_id" ON "articles" ("author_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_articles_published_revision_id" ON "articles" ("published_revision_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_articles_deleted_at" ON "articles" ("deleted_at")`,
    );
    await queryRunner.query(`
      CREATE INDEX "IDX_articles_public" ON "articles" ("published_at")
      WHERE "published_revision_id" IS NOT NULL AND "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "articles"`);
  }
}
