import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanies1786439431449 implements MigrationInterface {
  name = 'CreateCompanies1786439431449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "name" character varying NOT NULL, "website" character varying, "description" text, "suspended" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ee0839cba07cb0c52602021ad4b" UNIQUE ("user_id"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
