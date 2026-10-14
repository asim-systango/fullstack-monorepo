import { MigrationInterface, QueryRunner } from 'typeorm';

export class OneDeliveryStatusPerOrder1790000000000 implements MigrationInterface {
  name = 'OneDeliveryStatusPerOrder1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "delivery_statuses" ds
      USING "delivery_statuses" newer
      WHERE ds."order_id" = newer."order_id"
        AND (
          ds."created_at" < newer."created_at"
          OR (ds."created_at" = newer."created_at" AND ds."id" < newer."id")
        )
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_delivery_statuses_order_id"
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_delivery_statuses_order_id"
      ON "delivery_statuses" ("order_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_delivery_statuses_order_id"
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_delivery_statuses_order_id"
      ON "delivery_statuses" ("order_id")
    `);
  }
}
