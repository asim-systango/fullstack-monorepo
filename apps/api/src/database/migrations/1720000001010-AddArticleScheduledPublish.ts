import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Delayed publish uses the same pointer-pair pattern as review and publish:
 * `scheduled_*` records which revision should go live later;
 * `published_*` still decides public visibility. Neither implies the other.
 */
export class AddArticleScheduledPublish1720000001010 implements MigrationInterface {
  name = 'AddArticleScheduledPublish1720000001010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD "scheduled_at" TIMESTAMPTZ
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD "scheduled_revision_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD CONSTRAINT "FK_articles_scheduled_revision_id"
      FOREIGN KEY ("scheduled_revision_id")
      REFERENCES "revisions"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD CONSTRAINT "CHK_articles_scheduled_pair" CHECK (
        (
          "scheduled_revision_id" IS NULL
          AND "scheduled_at" IS NULL
        )
        OR (
          "scheduled_revision_id" IS NOT NULL
          AND "scheduled_at" IS NOT NULL
        )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_articles_scheduled_due"
      ON "articles" ("scheduled_at")
      WHERE "scheduled_revision_id" IS NOT NULL
        AND "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_articles_scheduled_due"`);
    await queryRunner.query(`
      ALTER TABLE "articles"
      DROP CONSTRAINT "CHK_articles_scheduled_pair"
    `);
    await queryRunner.query(`
      ALTER TABLE "articles"
      DROP CONSTRAINT "FK_articles_scheduled_revision_id"
    `);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "scheduled_revision_id"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "scheduled_at"`);
  }
}
