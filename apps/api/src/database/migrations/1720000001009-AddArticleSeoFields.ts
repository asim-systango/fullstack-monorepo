import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Per-article SEO fields used by GET /articles/public/:slug and the public
 * blog's generateMetadata(). All nullable — the public page falls back to
 * title / published excerpt / cover image when these are unset.
 */
export class AddArticleSeoFields1720000001009 implements MigrationInterface {
  name = 'AddArticleSeoFields1720000001009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD "meta_title" character varying(200)
    `);
    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD "meta_description" character varying(500)
    `);
    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD "og_image" character varying(2000)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "og_image"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "meta_description"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "meta_title"`);
  }
}
