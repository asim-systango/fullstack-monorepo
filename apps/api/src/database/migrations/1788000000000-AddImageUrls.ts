import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageUrls1788000000000 implements MigrationInterface {
  name = 'AddImageUrls1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "restaurants"
      ADD COLUMN "image_url" character varying(512)
    `);

    await queryRunner.query(`
      ALTER TABLE "menu_items"
      ADD COLUMN "image_url" character varying(512)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "menu_items"
      DROP COLUMN "image_url"
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurants"
      DROP COLUMN "image_url"
    `);
  }
}
