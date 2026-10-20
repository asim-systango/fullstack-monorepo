import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitFoodDelivery1786000000000 implements MigrationInterface {
  name = 'InitFoodDelivery1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "restaurants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "owner_user_id" uuid NOT NULL,
        "name" character varying(120) NOT NULL,
        "cuisine" character varying(80) NOT NULL,
        "address" text NOT NULL,
        "description" text,
        "emoji" character varying(10),
        "rating" numeric(2,1) NOT NULL DEFAULT 0,
        "eta" character varying(40),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_restaurants_rating"
          CHECK ("rating" >= 0 AND "rating" <= 5),
        CONSTRAINT "PK_restaurants" PRIMARY KEY ("id"),
        CONSTRAINT "FK_restaurants_owner_user"
          FOREIGN KEY ("owner_user_id") REFERENCES "users"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_restaurants_owner_user_id"
      ON "restaurants" ("owner_user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "menu_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" uuid NOT NULL,
        "name" character varying(120) NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL,
        "deleted_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_menu_items_price" CHECK ("price" >= 0),
        CONSTRAINT "PK_menu_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menu_items_restaurant"
          FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_menu_items_restaurant_id"
      ON "menu_items" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "menu_item_id" uuid NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_cart_items_quantity" CHECK ("quantity" > 0),
        CONSTRAINT "UQ_cart_items_user_menu_item"
          UNIQUE ("user_id", "menu_item_id"),
        CONSTRAINT "PK_cart_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cart_items_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_menu_item"
          FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cart_items_user_id"
      ON "cart_items" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cart_items_menu_item_id"
      ON "cart_items" ("menu_item_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "restaurant_id" uuid NOT NULL,
        "restaurant_name" character varying(120) NOT NULL,
        "status" character varying(30) NOT NULL DEFAULT 'placed',
        "delivery_address" text NOT NULL,
        "payment_status" character varying(20) NOT NULL DEFAULT 'pending',
        "subtotal" numeric(12,2) NOT NULL,
        "delivery_fee" numeric(12,2) NOT NULL,
        "platform_fee" numeric(12,2) NOT NULL,
        "tax_amount" numeric(12,2) NOT NULL,
        "total" numeric(12,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'INR',
        "estimated_minutes" integer,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_orders_amounts"
          CHECK (
            "subtotal" >= 0
            AND "delivery_fee" >= 0
            AND "platform_fee" >= 0
            AND "tax_amount" >= 0
            AND "total" >= 0
          ),
        CONSTRAINT "CHK_orders_estimated_minutes"
          CHECK ("estimated_minutes" IS NULL OR "estimated_minutes" > 0),
        CONSTRAINT "CHK_orders_status"
          CHECK (
            "status" IN (
              'placed',
              'preparing',
              'out_for_delivery',
              'delivered',
              'cancelled'
            )
          ),
        CONSTRAINT "CHK_orders_payment_status"
          CHECK ("payment_status" IN ('pending', 'paid', 'failed', 'refunded')),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE RESTRICT,
        CONSTRAINT "FK_orders_restaurant"
          FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_restaurant_id" ON "orders" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_status" ON "orders" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_payment_status" ON "orders" ("payment_status")
    `);

    await queryRunner.query(`
      CREATE TABLE "order_lines" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "menu_item_id" uuid,
        "item_name" character varying(120) NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_order_lines_quantity" CHECK ("quantity" > 0),
        CONSTRAINT "CHK_order_lines_unit_price" CHECK ("unit_price" >= 0),
        CONSTRAINT "PK_order_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_lines_order"
          FOREIGN KEY ("order_id") REFERENCES "orders"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_order_lines_menu_item"
          FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_order_lines_order_id" ON "order_lines" ("order_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "delivery_statuses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "status" character varying(30) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_delivery_statuses_status"
          CHECK (
            "status" IN (
              'placed',
              'preparing',
              'out_for_delivery',
              'delivered',
              'cancelled'
            )
          ),
        CONSTRAINT "PK_delivery_statuses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_delivery_statuses_order"
          FOREIGN KEY ("order_id") REFERENCES "orders"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_delivery_statuses_order_id"
      ON "delivery_statuses" ("order_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "provider" character varying(20) NOT NULL DEFAULT 'razorpay',
        "provider_order_id" character varying,
        "provider_payment_id" character varying,
        "provider_signature" text,
        "amount" integer NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'INR',
        "status" character varying(20) NOT NULL DEFAULT 'created',
        "failure_reason" text,
        "paid_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_payments_amount" CHECK ("amount" > 0),
        CONSTRAINT "CHK_payments_status"
          CHECK (
            "status" IN (
              'created',
              'authorized',
              'captured',
              'failed',
              'refunded'
            )
          ),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_order"
          FOREIGN KEY ("order_id") REFERENCES "orders"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_order_id" ON "payments" ("order_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_payments_provider_order_id"
      ON "payments" ("provider_order_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_payments_provider_payment_id"
      ON "payments" ("provider_payment_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_status" ON "payments" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "delivery_statuses"`);
    await queryRunner.query(`DROP TABLE "order_lines"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "menu_items"`);
    await queryRunner.query(`DROP TABLE "restaurants"`);
  }
}
