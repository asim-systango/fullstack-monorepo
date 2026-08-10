import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWarehouseIdToUsers1720000000002 implements MigrationInterface {
  name = 'AddWarehouseIdToUsers1720000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "warehouse_id" uuid;
    `);

    // Add foreign key constraint if warehouses table exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_users_warehouse'
        ) THEN
          ALTER TABLE "users"
          ADD CONSTRAINT "FK_users_warehouse"
          FOREIGN KEY ("warehouse_id")
          REFERENCES "warehouses"("id")
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_warehouse";
    `);
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "warehouse_id";
    `);
  }
}
