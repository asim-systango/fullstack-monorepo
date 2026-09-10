import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompositeIndexesToRsvpsAndWaitlist1788959000000 implements MigrationInterface {
  name = 'AddCompositeIndexesToRsvpsAndWaitlist1788959000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_rsvps_event_id_status" ON "rsvps" ("eventId", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_waitlist_entries_event_id_status" ON "waitlist_entries" ("eventId", "status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rsvps_event_id_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_waitlist_entries_event_id_status"`);
  }
}
