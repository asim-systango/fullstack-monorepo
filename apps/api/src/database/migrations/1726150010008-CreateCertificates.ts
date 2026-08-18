import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCertificates1726150010008 implements MigrationInterface {
  name = 'CreateCertificates1726150010008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "certificates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "enrollmentId" uuid NOT NULL,
        "issuedAt" timestamptz NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_certificates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_certificates_enrollment_id" UNIQUE ("enrollmentId")
      );
    `);
    await queryRunner.query(`
      ALTER TABLE "certificates"
        ADD CONSTRAINT "FK_certificates_enrollment" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "certificates" DROP CONSTRAINT "FK_certificates_enrollment";`,
    );
    await queryRunner.query(`DROP TABLE "certificates";`);
  }
}
