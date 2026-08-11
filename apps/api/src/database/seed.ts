import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Book } from '../modules/books/book.entity';
import { BookCopy } from '../modules/books/book-copy.entity';
import { BookCopyStatus } from '../modules/books/enums/book-copy-status.enum';
import { MemberProfile } from '../modules/members/member-profile.entity';
import { MemberStatus } from '../modules/members/enums/member-status.enum';

/**
 * Demo staff UUID for `created_by` (no cross-DB FK to gateway users).
 * Must match gateway seed `staff@demo.local`.
 */
export const SEED_STAFF_USER_ID = '00000000-0000-4000-8000-000000000001';

/** Must match gateway seed `user@demo.local`. */
export const SEED_MEMBER_USER_ID = '00000000-0000-4000-8000-0000000000b1';

type SeedBook = {
  title: string;
  author: string;
  isbn: string;
  description: string;
  publishedYear: number;
  copies: Array<{ barcode: string; status: BookCopyStatus; acquiredAt: string }>;
};

const SEED_BOOKS: SeedBook[] = [
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    isbn: '9780135957059',
    description: 'Classic software craftsmanship guide.',
    publishedYear: 2019,
    copies: [
      {
        barcode: 'BKLY-0001',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-01-10',
      },
      { barcode: 'BKLY-0002', status: BookCopyStatus.OnLoan, acquiredAt: '2024-01-10' },
    ],
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    description: 'A handbook of agile software craftsmanship.',
    publishedYear: 2008,
    copies: [
      {
        barcode: 'BKLY-0003',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-02-01',
      },
      {
        barcode: 'BKLY-0004',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-02-01',
      },
    ],
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '9781449373320',
    description: 'The big ideas behind reliable, scalable systems.',
    publishedYear: 2017,
    copies: [
      {
        barcode: 'BKLY-0005',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-03-15',
      },
      { barcode: 'BKLY-0006', status: BookCopyStatus.Lost, acquiredAt: '2024-03-15' },
    ],
  },
  {
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    isbn: '9780321125217',
    description: 'Tackling complexity in the heart of software.',
    publishedYear: 2003,
    copies: [
      {
        barcode: 'BKLY-0007',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-04-20',
      },
      { barcode: 'BKLY-0008', status: BookCopyStatus.OnLoan, acquiredAt: '2024-04-20' },
    ],
  },
];

async function seed() {
  await dataSource.initialize();
  const books = dataSource.getRepository(Book);
  const copies = dataSource.getRepository(BookCopy);
  const members = dataSource.getRepository(MemberProfile);

  let booksCreated = 0;
  let copiesCreated = 0;

  for (const row of SEED_BOOKS) {
    let book = await books.findOne({
      where: { isbn: row.isbn, title: row.title },
    });

    if (!book) {
      book = await books.save(
        books.create({
          title: row.title,
          author: row.author,
          isbn: row.isbn,
          description: row.description,
          publishedYear: row.publishedYear,
          createdBy: SEED_STAFF_USER_ID,
        }),
      );
      booksCreated += 1;
    }

    for (const copyRow of row.copies) {
      const existing = await copies.findOne({
        where: { barcode: copyRow.barcode },
        withDeleted: true,
      });
      if (existing) continue;

      await copies.save(
        copies.create({
          bookId: book.id,
          barcode: copyRow.barcode,
          status: copyRow.status,
          acquiredAt: copyRow.acquiredAt,
        }),
      );
      copiesCreated += 1;
    }
  }

  const existingMember = await members.findOne({
    where: { userId: SEED_MEMBER_USER_ID },
  });
  if (!existingMember) {
    // Prefer the stable seed id; fall back to looking up gateway `users` (same DB).
    let memberUserId = SEED_MEMBER_USER_ID;
    let email = 'user@demo.local';
    let fullName = 'Demo User';
    try {
      const rows = (await dataSource.query(
        `SELECT id, email, name FROM users WHERE lower(email::text) = $1 LIMIT 1`,
        ['user@demo.local'],
      )) as Array<{ id: string; email: string; name: string }>;
      if (rows[0]) {
        memberUserId = rows[0].id;
        email = rows[0].email;
        fullName = rows[0].name;
      }
    } catch {
      // users table may be absent in isolated domain-only setups — use constants.
    }

    const byLookup = await members.findOne({ where: { userId: memberUserId } });
    if (!byLookup) {
      await members.save(
        members.create({
          userId: memberUserId,
          email,
          fullName,
          status: MemberStatus.Active,
        }),
      );
    }
  }

  console.log('Domain seed complete', {
    booksCreated,
    copiesCreated,
    staffCreatedBy: SEED_STAFF_USER_ID,
    memberUserId: SEED_MEMBER_USER_ID,
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
