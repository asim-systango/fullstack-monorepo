import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageUrlToProducts1720000000003 implements MigrationInterface {
  name = 'AddImageUrlToProducts1720000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "image_url" text;
    `);

    // Backfill existing products with user-specified image URLs
    await queryRunner.query(`
      UPDATE "products" SET "image_url" = CASE (abs(hashtext("id"::text)) % 6)
        WHEN 0 THEN 'https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U'
        WHEN 1 THEN 'https://fastly.picsum.photos/id/30/1280/901.jpg?hmac=A_hpFyEavMBB7Dsmmp53kPXKmatwM05MUDatlWSgATE'
        WHEN 2 THEN 'https://fastly.picsum.photos/id/89/4608/2592.jpg?hmac=G9E4z5RMJgMUjgTzeR4CFlORjvogsGtqFQozIRqugBk'
        WHEN 3 THEN 'https://fastly.picsum.photos/id/84/1280/848.jpg?hmac=YFRYDI4UsfbeTzI8ZakNOR98wVU7a-9a2tGF542539s'
        WHEN 4 THEN 'https://fastly.picsum.photos/id/96/4752/3168.jpg?hmac=KNXudB1q84CHl2opIFEY4ph12da5JD5GzKzH5SeuRVM'
        ELSE 'https://fastly.picsum.photos/id/119/3264/2176.jpg?hmac=PYRYBOGQhlUm6wS94EkpN8dTIC7-2GniC3pqOt6CpNU'
      END
      WHERE "image_url" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products" DROP COLUMN IF EXISTS "image_url";
    `);
  }
}
