import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRolesAndSuperAdmin1756480000000 implements MigrationInterface {
  name = 'SeedRolesAndSuperAdmin1756480000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const superAdminRoleId = '01J00000000000000000000R01';
    const orgAdminRoleId = '01J00000000000000000000R02'; // 26 chars
    const salesLeadRoleId = '01J00000000000000000000R03'; // 26 chars
    const salesRepRoleId = '01J00000000000000000000R04'; // 26 chars
    const superAdminUserId = '01J00000000000000000000U01'; // 26 chars

    // 1. Insert default roles
    await queryRunner.query(
      `INSERT INTO "roles" ("id", "name", "description") VALUES
        ('${superAdminRoleId}', 'SUPER_ADMIN', 'System Super Administrator with full access across all organizations.'),
        ('${orgAdminRoleId}', 'ORG_ADMIN', 'Organization Administrator with full organization level management access.'),
        ('${salesLeadRoleId}', 'SALES_LEAD', 'Sales Lead with team management, lead assignment, and deal oversight access.'),
        ('${salesRepRoleId}', 'SALES_REP', 'Sales Representative with individual lead management and deal execution access.')
      ON CONFLICT ("name") DO NOTHING;`,
    );

    // 2. Insert initial Super Admin User (Password: SuperAdmin123!)
    await queryRunner.query(
      `INSERT INTO "users" (
        "id", "organizationId", "roleId", "firstName", "lastName", "email", "passwordHash", "status", "isPasswordChangeRequired"
      ) VALUES (
        '${superAdminUserId}',
        NULL,
        '${superAdminRoleId}',
        'Super',
        'Admin',
        'superadmin@crm.com',
        '$2b$10$CiPer1x6c819ZX30jlmi4.jZDthxM/dl0PNLwwPQWH4bUjqUSDLL.',
        'ACTIVE',
        false
      )
      ON CONFLICT ("email") DO NOTHING;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "users" WHERE "id" = '01J00000000000000000000U01'`,
    );
    await queryRunner.query(
      `DELETE FROM "roles" WHERE "id" IN (
        '01J00000000000000000000R01',
        '01J00000000000000000000R02',
        '01J00000000000000000000R03',
        '01J00000000000000000000R04'
      )`,
    );
  }
}
