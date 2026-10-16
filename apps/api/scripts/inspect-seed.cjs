require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const loans = await c.query(`
    select bc.barcode, l.returned_at is null as active, l.due_date::text, l.user_id::text
    from loan l
    join book_copy bc on bc.id = l.book_copy_id
    order by l.borrowed_at desc
    limit 20`);
  console.log('loans', loans.rows);
  const res = await c.query(
    `select status, queue_position, user_id::text from reservation order by created_at`,
  );
  console.log('reservations', res.rows);
  const copies = await c.query(
    `select barcode, status from book_copy where deleted_at is null order by barcode`,
  );
  console.log('copies', copies.rows);
  await c.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
