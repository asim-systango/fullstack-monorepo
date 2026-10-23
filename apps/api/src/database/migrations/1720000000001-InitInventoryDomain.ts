import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitInventoryDomain1720000000001 implements MigrationInterface {
  name = 'InitInventoryDomain1720000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Warehouses Table (Indore Hubs)
    await queryRunner.query(`
      CREATE TABLE "warehouses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying NOT NULL,
        "name" character varying NOT NULL,
        "location" character varying NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_warehouses_code" UNIQUE ("code"),
        CONSTRAINT "PK_warehouses" PRIMARY KEY ("id")
      )
    `);

    // 2. Categories Table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    // 3. Products Table (with category_id FK, no low_stock_threshold)
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sku" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "category_id" uuid NOT NULL,
        "unit" character varying NOT NULL DEFAULT 'pcs',
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT
      )
    `);

    // 4. Stock Levels Table (with UNIQUE and CHECK quantity >= 0)
    await queryRunner.query(`
      CREATE TABLE "stock_levels" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "warehouse_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL DEFAULT 0,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_stock_levels_warehouse_product" UNIQUE ("warehouse_id", "product_id"),
        CONSTRAINT "CHK_stock_levels_quantity_non_negative" CHECK ("quantity" >= 0),
        CONSTRAINT "PK_stock_levels" PRIMARY KEY ("id"),
        CONSTRAINT "FK_stock_levels_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_stock_levels_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // 5. Stock Movements Table
    await queryRunner.query(`
      CREATE TABLE "stock_movements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "warehouse_id" uuid NOT NULL,
        "source_warehouse_id" uuid,
        "product_id" uuid NOT NULL,
        "type" character varying(20) NOT NULL,
        "quantity" integer NOT NULL,
        "reason" character varying,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_movements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_stock_movements_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id"),
        CONSTRAINT "FK_stock_movements_source_warehouse" FOREIGN KEY ("source_warehouse_id") REFERENCES "warehouses"("id"),
        CONSTRAINT "FK_stock_movements_product" FOREIGN KEY ("product_id") REFERENCES "products"("id"),
        CONSTRAINT "FK_stock_movements_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stock_movements"`);
    await queryRunner.query(`DROP TABLE "stock_levels"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "warehouses"`);
  }
}
