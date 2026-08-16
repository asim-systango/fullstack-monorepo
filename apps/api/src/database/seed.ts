import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { Book } from '../modules/books/book.entity';
import { BookCopy } from '../modules/books/book-copy.entity';
import { BookCopyStatus } from '../modules/books/enums/book-copy-status.enum';
import { CheckoutRequest } from '../modules/checkout-requests/checkout-request.entity';
import { Fine } from '../modules/fines/fine.entity';
import { FineStatus } from '../modules/fines/enums/fine-status.enum';
import { Loan } from '../modules/loans/loan.entity';
import { MemberProfile } from '../modules/members/member-profile.entity';
import { MemberStatus } from '../modules/members/enums/member-status.enum';
import { Reservation } from '../modules/reservations/reservation.entity';
import { ReservationStatus } from '../modules/reservations/enums/reservation-status.enum';
import { AppSetting } from '../modules/settings/app-setting.entity';
import { AppSettingValueType } from '../modules/settings/enums/app-setting-value-type.enum';
import { SETTING_DEFAULTS } from '../modules/settings/setting-keys';
import { User } from '../modules/users';

export const SEED_ADMIN_USER_ID = '00000000-0000-4000-8000-0000000000a1';
export const SEED_MEMBER_USER_ID = '00000000-0000-4000-8000-0000000000b1';
export const SEED_MEMBER2_USER_ID = '00000000-0000-4000-8000-0000000000b2';
export const SEED_MEMBER3_USER_ID = '00000000-0000-4000-8000-0000000000b3';
export const SEED_STAFF_USER_ID = '00000000-0000-4000-8000-000000000001';

const SEED_PASSWORD = 'password123';
const SEED_ACQUIRED_AT = '2025-01-15';
const FINE_CENTS_PER_DAY = 50;
const OVERDUE_DAYS = 4;

type SeedBook = {
  title: string;
  author: string;
  isbn: string;
  description: string;
  publishedYear: number;
  copies: Array<{ barcode: string; acquiredAt: string }>;
};

const SEED_BOOKS: SeedBook[] = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    description:
      'Atomic Habits explains how small, consistent changes compound into remarkable results over time. James Clear lays out a practical system for building good habits and breaking bad ones through identity, environment design, and habit stacking. The book shows why systems matter more than goals, and how tiny improvements repeated daily create lasting change.',
    publishedYear: 2018,
    copies: [
      { barcode: 'BKLY-0015', acquiredAt: '2024-08-01' },
      { barcode: 'BKLY-0016', acquiredAt: '2024-08-01' },
    ],
  },
  {
    title: 'Zero to One',
    author: 'Peter Thiel with Blake Masters',
    isbn: '9780804139298',
    description:
      'Zero to One is Peter Thiel’s argument for building companies that create something new rather than copying what already exists. Drawing on his work as a founder and investor, he discusses monopoly versus competition, the role of technology, and how to think from first principles. The book is a concise guide for readers who want to move from incremental improvement to genuine innovation.',
    publishedYear: 2014,
    copies: [{ barcode: 'BKLY-0027', acquiredAt: SEED_ACQUIRED_AT }],
  },
  {
    title: "Build, Don't Talk",
    author: 'Raj Shamani',
    isbn: '9780143465874',
    description:
      'Build, Don’t Talk is Raj Shamani’s practical playbook for acting on ambition instead of only discussing it. He covers mindset, communication, relationships, money, and creating opportunity, with an emphasis on skills young professionals can apply immediately. The book argues that consistent execution—not talk—is what compounds into a career and a life you control.',
    publishedYear: 2024,
    copies: [
      { barcode: 'BKLY-0023', acquiredAt: SEED_ACQUIRED_AT },
      { barcode: 'BKLY-0024', acquiredAt: SEED_ACQUIRED_AT },
    ],
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '9780062315007',
    description:
      'The Alchemist follows Santiago, a young shepherd who leaves Spain in search of a treasure he has dreamed of finding near the Egyptian pyramids. Along the way he meets people who test his courage, faith, and willingness to listen to his heart. Paulo Coelho’s fable is a widely read story about purpose, perseverance, and the cost of ignoring a personal calling.',
    publishedYear: 1993,
    copies: [
      { barcode: 'BKLY-0025', acquiredAt: SEED_ACQUIRED_AT },
      { barcode: 'BKLY-0026', acquiredAt: SEED_ACQUIRED_AT },
      { barcode: 'BKLY-0028', acquiredAt: SEED_ACQUIRED_AT },
    ],
  },
];

const KEEP_ISBNS = new Set(SEED_BOOKS.map((row) => row.isbn));
const KEEP_BARCODES = new Set(
  SEED_BOOKS.flatMap((row) => row.copies.map((copy) => copy.barcode)),
);

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function dateDaysAgo(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const books = dataSource.getRepository(Book);
  const copies = dataSource.getRepository(BookCopy);
  const members = dataSource.getRepository(MemberProfile);
  const loans = dataSource.getRepository(Loan);
  const reservations = dataSource.getRepository(Reservation);
  const fines = dataSource.getRepository(Fine);
  const checkoutRequests = dataSource.getRepository(CheckoutRequest);
  const settings = dataSource.getRepository(AppSetting);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const verifiedAt = new Date();

  const userSeeds: Array<{
    id: string;
    email: string;
    legacyEmail: string;
    name: string;
    role: User['role'];
  }> = [
    {
      id: SEED_ADMIN_USER_ID,
      email: 'admin@demo.com',
      legacyEmail: 'admin@demo.local',
      name: 'Demo Admin',
      role: 'admin',
    },
    {
      id: SEED_STAFF_USER_ID,
      email: 'staff@demo.com',
      legacyEmail: 'staff@demo.local',
      name: 'Demo Staff',
      role: 'staff',
    },
    {
      id: SEED_MEMBER_USER_ID,
      email: 'user@demo.com',
      legacyEmail: 'user@demo.local',
      name: 'Yashi Member',
      role: 'user',
    },
    {
      id: SEED_MEMBER2_USER_ID,
      email: 'user2@demo.com',
      legacyEmail: 'user2@demo.local',
      name: 'Aisha Reader',
      role: 'user',
    },
    {
      id: SEED_MEMBER3_USER_ID,
      email: 'user3@demo.com',
      legacyEmail: 'user3@demo.local',
      name: 'Rohan Patron',
      role: 'user',
    },
  ];

  for (const row of userSeeds) {
    const existing =
      (await users.findOne({ where: { id: row.id } })) ??
      (await users.findOne({ where: { email: row.email } })) ??
      (await users.findOne({ where: { email: row.legacyEmail } }));

    if (!existing) {
      await users.save(
        users.create({
          id: row.id,
          email: row.email,
          name: row.name,
          passwordHash,
          role: row.role,
          emailVerifiedAt: verifiedAt,
          otpAttempts: 0,
        }),
      );
      continue;
    }

    existing.email = row.email;
    existing.name = row.name;
    existing.role = row.role;
    existing.passwordHash = passwordHash;
    existing.emailVerifiedAt = existing.emailVerifiedAt ?? verifiedAt;
    existing.mustChangePassword = false;
    await users.save(existing);
  }

  for (const [key, meta] of Object.entries(SETTING_DEFAULTS)) {
    const existing = await settings.findOne({ where: { key } });
    if (existing) continue;
    await settings.save(
      settings.create({
        key,
        value: meta.value,
        valueType: AppSettingValueType.Integer,
        description: meta.description,
        updatedBy: null,
      }),
    );
  }

  await checkoutRequests.createQueryBuilder().delete().execute();
  await fines.createQueryBuilder().delete().execute();
  await reservations.createQueryBuilder().delete().execute();
  await loans.createQueryBuilder().delete().execute();

  const bookByIsbn = new Map<string, Book>();

  for (const row of SEED_BOOKS) {
    let book = await books.findOne({
      where: { isbn: row.isbn },
      withDeleted: true,
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
    } else {
      if (book.deletedAt) {
        await books.recover(book);
        book.deletedAt = null;
      }
      book.title = row.title;
      book.author = row.author;
      book.description = row.description;
      book.publishedYear = row.publishedYear;
      await books.save(book);
    }
    bookByIsbn.set(row.isbn, book);

    for (const copyRow of row.copies) {
      const existing = await copies.findOne({
        where: { barcode: copyRow.barcode },
        withDeleted: true,
      });
      if (existing) {
        if (existing.deletedAt) {
          await copies.recover(existing);
          existing.deletedAt = null;
        }
        existing.bookId = book.id;
        existing.status = BookCopyStatus.Available;
        existing.acquiredAt = copyRow.acquiredAt;
        await copies.save(existing);
        continue;
      }

      await copies.save(
        copies.create({
          bookId: book.id,
          barcode: copyRow.barcode,
          status: BookCopyStatus.Available,
          acquiredAt: copyRow.acquiredAt,
        }),
      );
    }
  }

  const extraBooks = await books.find({ withDeleted: true });
  for (const extra of extraBooks) {
    if (!KEEP_ISBNS.has(extra.isbn)) {
      if (!extra.deletedAt) {
        await books.softRemove(extra);
      }
    }
  }

  const allCopies = await copies.find({ withDeleted: true });
  for (const copy of allCopies) {
    if (!KEEP_BARCODES.has(copy.barcode) && !copy.deletedAt) {
      await copies.softRemove(copy);
    }
  }

  for (const m of [
    {
      userId: SEED_MEMBER_USER_ID,
      email: 'user@demo.com',
      fullName: 'Yashi Member',
    },
    {
      userId: SEED_MEMBER2_USER_ID,
      email: 'user2@demo.com',
      fullName: 'Aisha Reader',
    },
    {
      userId: SEED_MEMBER3_USER_ID,
      email: 'user3@demo.com',
      fullName: 'Rohan Patron',
    },
  ]) {
    const existingMember = await members.findOne({ where: { userId: m.userId } });
    if (!existingMember) {
      await members.save(
        members.create({
          userId: m.userId,
          email: m.email,
          fullName: m.fullName,
          status: MemberStatus.Active,
        }),
      );
    } else {
      existingMember.email = m.email;
      existingMember.fullName = m.fullName;
      existingMember.status = MemberStatus.Active;
      await members.save(existingMember);
    }
  }

  const copyByBarcode = async (barcode: string) => {
    const copy = await copies.findOne({ where: { barcode } });
    if (!copy) throw new Error(`Missing seed copy ${barcode}`);
    return copy;
  };

  const createActiveLoan = async (input: {
    userId: string;
    barcode: string;
    dueDate: string;
    borrowedDaysAgo: number;
  }) => {
    const copy = await copyByBarcode(input.barcode);
    copy.status = BookCopyStatus.OnLoan;
    await copies.save(copy);

    return loans.save(
      loans.create({
        userId: input.userId,
        bookCopyId: copy.id,
        bookId: copy.bookId,
        borrowedAt: dateDaysAgo(input.borrowedDaysAgo),
        dueDate: input.dueDate,
        returnedAt: null,
        checkedOutBy: SEED_STAFF_USER_ID,
        returnedTo: null,
      }),
    );
  };

  const createReturnedLoan = async (input: {
    userId: string;
    barcode: string;
    dueDate: string;
    borrowedDaysAgo: number;
    returnedDaysAgo: number;
  }) => {
    const copy = await copyByBarcode(input.barcode);
    copy.status = BookCopyStatus.Available;
    await copies.save(copy);

    return loans.save(
      loans.create({
        userId: input.userId,
        bookCopyId: copy.id,
        bookId: copy.bookId,
        borrowedAt: dateDaysAgo(input.borrowedDaysAgo),
        dueDate: input.dueDate,
        returnedAt: dateDaysAgo(input.returnedDaysAgo),
        checkedOutBy: SEED_STAFF_USER_ID,
        returnedTo: SEED_STAFF_USER_ID,
      }),
    );
  };

  const overdueLoan = await createActiveLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0027',
    dueDate: daysAgoIso(OVERDUE_DAYS),
    borrowedDaysAgo: 18,
  });

  await createActiveLoan({
    userId: SEED_MEMBER2_USER_ID,
    barcode: 'BKLY-0015',
    dueDate: daysAgoIso(-5),
    borrowedDaysAgo: 9,
  });

  await createActiveLoan({
    userId: SEED_MEMBER3_USER_ID,
    barcode: 'BKLY-0016',
    dueDate: daysAgoIso(-9),
    borrowedDaysAgo: 5,
  });

  await createReturnedLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0023',
    dueDate: daysAgoIso(20),
    borrowedDaysAgo: 40,
    returnedDaysAgo: 12,
  });

  await createReturnedLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0025',
    dueDate: daysAgoIso(8),
    borrowedDaysAgo: 22,
    returnedDaysAgo: 6,
  });

  await fines.save(
    fines.create({
      loanId: overdueLoan.id,
      userId: overdueLoan.userId,
      daysOverdue: OVERDUE_DAYS,
      amountCents: OVERDUE_DAYS * FINE_CENTS_PER_DAY,
      status: FineStatus.Unpaid,
    }),
  );

  const atomic = bookByIsbn.get('9780735211292');
  const zeroToOne = bookByIsbn.get('9780804139298');
  if (!atomic || !zeroToOne) {
    throw new Error('Seed books missing after upsert');
  }

  await reservations.save(
    reservations.create({
      userId: SEED_MEMBER_USER_ID,
      bookId: atomic.id,
      status: ReservationStatus.Active,
      queuePosition: 1,
    }),
  );
  await reservations.save(
    reservations.create({
      userId: SEED_MEMBER2_USER_ID,
      bookId: zeroToOne.id,
      status: ReservationStatus.Active,
      queuePosition: 1,
    }),
  );

  const liveCopies = await copies.find({ withDeleted: false });
  for (const copy of liveCopies) {
    const active = await loans
      .createQueryBuilder('loan')
      .where('loan.book_copy_id = :copyId', { copyId: copy.id })
      .andWhere('loan.returned_at IS NULL')
      .getOne();
    const nextStatus = active ? BookCopyStatus.OnLoan : BookCopyStatus.Available;
    if (copy.status !== nextStatus) {
      copy.status = nextStatus;
      await copies.save(copy);
    }
  }

  const [bookCount, copyCount, loanCount, activeLoanCount, reservationCount, fineCount] =
    await Promise.all([
      books.count(),
      copies.count(),
      loans.count(),
      loans.createQueryBuilder('loan').where('loan.returned_at IS NULL').getCount(),
      reservations.count(),
      fines.count(),
    ]);

  console.log('Seed complete — password for demo users: password123', {
    demoLogins: ['admin@demo.com', 'staff@demo.com', 'user@demo.com'],
    counts: {
      books: bookCount,
      copies: copyCount,
      loans: loanCount,
      activeLoans: activeLoanCount,
      reservations: reservationCount,
      fines: fineCount,
    },
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
