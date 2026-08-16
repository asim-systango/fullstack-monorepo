import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComments1720000001004 implements MigrationInterface {
  name = 'CreateComments1720000001004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "article_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "body" text NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_article_id" FOREIGN KEY ("article_id")
          REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_comments_article_id" ON "comments" ("article_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_user_id" ON "comments" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_deleted_at" ON "comments" ("deleted_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
