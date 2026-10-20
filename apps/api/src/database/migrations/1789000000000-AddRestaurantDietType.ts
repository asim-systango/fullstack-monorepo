import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRestaurantDietType1789000000000 implements MigrationInterface {
  name = 'AddRestaurantDietType1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "restaurants"
      ADD COLUMN "diet_type" character varying(16) NOT NULL DEFAULT 'both'
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurants"
      ADD CONSTRAINT "CHK_restaurants_diet_type"
      CHECK ("diet_type" IN ('veg', 'non_veg', 'both'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "restaurants"
      DROP CONSTRAINT "CHK_restaurants_diet_type"
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurants"
      DROP COLUMN "diet_type"
    `);
  }
}
