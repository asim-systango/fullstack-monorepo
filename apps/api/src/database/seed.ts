import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { Book } from '../modules/books/book.entity';
import { BookCopy } from '../modules/books/book-copy.entity';
import { BookCopyStatus } from '../modules/books/enums/book-copy-status.enum';
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

const LOAN_BY_COPY_ID = 'loan.book_copy_id = :copyId';

type SeedBook = {
  title: string;
  author: string;
  isbn: string;
  description: string | null;
  publishedYear: number | null;
  copies: Array<{ barcode: string; status: BookCopyStatus; acquiredAt: string }>;
};

const SEED_BOOKS: SeedBook[] = [
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    isbn: '9780135957059',
    description:
      'Your journey to mastery — timeless tips for writing flexible, maintainable software with craft and care.',
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
    description:
      'A handbook of agile software craftsmanship — naming, functions, classes, and the discipline of clean design.',
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
    description:
      'The big ideas behind reliable, scalable, and maintainable data systems — storage, encoding, and distributed truth.',
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
    description:
      'Tackling complexity in the heart of software with ubiquitous language, bounded contexts, and rich domain models.',
    publishedYear: 2003,
    copies: [
      { barcode: 'BKLY-0007', status: BookCopyStatus.OnLoan, acquiredAt: '2024-04-20' },
      { barcode: 'BKLY-0008', status: BookCopyStatus.OnLoan, acquiredAt: '2024-04-20' },
    ],
  },
  {
    title: 'Refactoring',
    author: 'Martin Fowler',
    isbn: '9780134757599',
    description:
      'Improving the design of existing code with a catalog of refactorings and a disciplined, test-backed approach.',
    publishedYear: 2018,
    copies: [
      { barcode: 'BKLY-0009', status: BookCopyStatus.OnLoan, acquiredAt: '2024-05-01' },
      {
        barcode: 'BKLY-0010',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-05-01',
      },
    ],
  },
  {
    title: 'Staff Engineer',
    author: 'Will Larson',
    isbn: '9781736417904',
    description:
      'Leadership beyond the management track — scope, influence, and how senior ICs create leverage.',
    publishedYear: 2021,
    copies: [
      { barcode: 'BKLY-0011', status: BookCopyStatus.OnLoan, acquiredAt: '2024-06-12' },
      {
        barcode: 'BKLY-0012',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-06-12',
      },
    ],
  },
  {
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    isbn: '9780465050659',
    description:
      'How good design makes products understandable — affordances, feedback, and human-centered thinking.',
    publishedYear: 2013,
    copies: [
      {
        barcode: 'BKLY-0013',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-07-08',
      },
      {
        barcode: 'BKLY-0014',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-07-08',
      },
    ],
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    description:
      'Tiny changes, remarkable results — building systems of habit that compound over time.',
    publishedYear: 2018,
    copies: [
      {
        barcode: 'BKLY-0015',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-08-01',
      },
      { barcode: 'BKLY-0016', status: BookCopyStatus.OnLoan, acquiredAt: '2024-08-01' },
    ],
  },
  {
    title: 'Thinking in Systems',
    author: 'Donella H. Meadows',
    isbn: '9781603580557',
    description: null,
    publishedYear: 2008,
    copies: [
      {
        barcode: 'BKLY-0017',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-09-01',
      },
    ],
  },
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    isbn: '9780525559474',
    description:
      'Between life and death there is a library — and within it, infinite lives Nora Seed could have lived.',
    publishedYear: 2020,
    copies: [
      { barcode: 'BKLY-0018', status: BookCopyStatus.OnLoan, acquiredAt: '2024-10-01' },
      { barcode: 'BKLY-0019', status: BookCopyStatus.OnLoan, acquiredAt: '2024-10-01' },
    ],
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    isbn: '9780593135204',
    description:
      'A lone astronaut. An impossible mission. Science, friendship, and one last chance to save Earth.',
    publishedYear: 2021,
    copies: [
      {
        barcode: 'BKLY-0020',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-11-01',
      },
      {
        barcode: 'BKLY-0021',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-11-01',
      },
    ],
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    isbn: '9780399590504',
    description:
      'A memoir of leaving a survivalist upbringing and discovering education as a path to selfhood.',
    publishedYear: 2018,
    copies: [
      {
        barcode: 'BKLY-0022',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-12-01',
      },
    ],
  },
];

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
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
  const settings = dataSource.getRepository(AppSetting);

  const passwordHash = await bcrypt.hash('password123', 12);
  const verifiedAt = new Date();

  const userSeeds: Array<{
    id: string;
    email: string;
    name: string;
    role: User['role'];
  }> = [
    {
      id: SEED_ADMIN_USER_ID,
      email: 'admin@demo.local',
      name: 'Demo Admin',
      role: 'admin',
    },
    {
      id: SEED_MEMBER_USER_ID,
      email: 'user@demo.local',
      name: 'Yashi Member',
      role: 'user',
    },
    {
      id: SEED_MEMBER2_USER_ID,
      email: 'user2@demo.local',
      name: 'Aisha Reader',
      role: 'user',
    },
    {
      id: SEED_MEMBER3_USER_ID,
      email: 'user3@demo.local',
      name: 'Rohan Patron',
      role: 'user',
    },
    {
      id: SEED_STAFF_USER_ID,
      email: 'staff@demo.local',
      name: 'Demo Staff',
      role: 'staff',
    },
  ];

  for (const row of userSeeds) {
    const existing = await users.findOne({ where: { email: row.email } });
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
    } else {
      existing.name = row.name;
      if (!existing.emailVerifiedAt) existing.emailVerifiedAt = verifiedAt;
      await users.save(existing);
    }
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

  let booksCreated = 0;
  let copiesCreated = 0;
  const bookByIsbn = new Map<string, Book>();

  for (const row of SEED_BOOKS) {
    let book = await books.findOne({
      where: { isbn: row.isbn },
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
    } else {
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
        if (existing.status !== copyRow.status && !existing.deletedAt) {
          const hasLoan = await loans.findOne({
            where: { bookCopyId: existing.id },
          });
          if (!hasLoan) {
            existing.status = copyRow.status;
            await copies.save(existing);
          }
        }
        continue;
      }

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

  for (const m of [
    {
      userId: SEED_MEMBER_USER_ID,
      email: 'user@demo.local',
      fullName: 'Yashi Member',
    },
    {
      userId: SEED_MEMBER2_USER_ID,
      email: 'user2@demo.local',
      fullName: 'Aisha Reader',
    },
    {
      userId: SEED_MEMBER3_USER_ID,
      email: 'user3@demo.local',
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

  const ensureActiveLoan = async (input: {
    userId: string;
    barcode: string;
    dueDate: string;
    borrowedDaysAgo: number;
  }) => {
    const copy = await copyByBarcode(input.barcode);
    const active = await loans
      .createQueryBuilder('loan')
      .where(LOAN_BY_COPY_ID, { copyId: copy.id })
      .andWhere('loan.returned_at IS NULL')
      .getOne();
    if (active) {
      active.dueDate = input.dueDate;
      active.userId = input.userId;
      await loans.save(active);
      copy.status = BookCopyStatus.OnLoan;
      await copies.save(copy);
      return active;
    }

    copy.status = BookCopyStatus.OnLoan;
    await copies.save(copy);

    const borrowedAt = new Date();
    borrowedAt.setUTCDate(borrowedAt.getUTCDate() - input.borrowedDaysAgo);

    return loans.save(
      loans.create({
        userId: input.userId,
        bookCopyId: copy.id,
        bookId: copy.bookId,
        borrowedAt,
        dueDate: input.dueDate,
        returnedAt: null,
        checkedOutBy: SEED_STAFF_USER_ID,
        returnedTo: null,
      }),
    );
  };

  const ensureReturnedLoan = async (input: {
    userId: string;
    barcode: string;
    dueDate: string;
    returnedDaysAgo: number;
    borrowedDaysAgo: number;
  }) => {
    const copy = await copyByBarcode(input.barcode);
    const existingReturned = await loans
      .createQueryBuilder('loan')
      .where(LOAN_BY_COPY_ID, { copyId: copy.id })
      .andWhere('loan.user_id = :userId', { userId: input.userId })
      .andWhere('loan.returned_at IS NOT NULL')
      .getOne();
    if (existingReturned) return existingReturned;

    const activeOnCopy = await loans
      .createQueryBuilder('loan')
      .where(LOAN_BY_COPY_ID, { copyId: copy.id })
      .andWhere('loan.returned_at IS NULL')
      .getOne();
    if (activeOnCopy) return activeOnCopy;

    const borrowedAt = new Date();
    borrowedAt.setUTCDate(borrowedAt.getUTCDate() - input.borrowedDaysAgo);
    const returnedAt = new Date();
    returnedAt.setUTCDate(returnedAt.getUTCDate() - input.returnedDaysAgo);

    return loans.save(
      loans.create({
        userId: input.userId,
        bookCopyId: copy.id,
        bookId: copy.bookId,
        borrowedAt,
        dueDate: input.dueDate,
        returnedAt,
        checkedOutBy: SEED_STAFF_USER_ID,
        returnedTo: SEED_STAFF_USER_ID,
      }),
    );
  };

  const ensureFine = async (input: {
    loan: Loan;
    daysOverdue: number;
    amountCents: number;
    status: FineStatus;
    waivedReason?: string;
  }) => {
    const existingFine = await fines.findOne({ where: { loanId: input.loan.id } });
    if (existingFine) {
      existingFine.daysOverdue = input.daysOverdue;
      existingFine.amountCents = input.amountCents;
      existingFine.status = input.status;
      if (input.status === FineStatus.Paid) {
        existingFine.paidAt = existingFine.paidAt ?? new Date();
        existingFine.markedPaidBy = SEED_STAFF_USER_ID;
      }
      if (input.status === FineStatus.Waived) {
        existingFine.waivedAt = existingFine.waivedAt ?? new Date();
        existingFine.waivedBy = SEED_STAFF_USER_ID;
        existingFine.waivedReason = input.waivedReason ?? 'Seed waiver for UI review';
      }
      await fines.save(existingFine);
      return existingFine;
    }

    return fines.save(
      fines.create({
        loanId: input.loan.id,
        userId: input.loan.userId,
        daysOverdue: input.daysOverdue,
        amountCents: input.amountCents,
        status: input.status,
        paidAt: input.status === FineStatus.Paid ? new Date() : null,
        markedPaidBy: input.status === FineStatus.Paid ? SEED_STAFF_USER_ID : null,
        waivedAt: input.status === FineStatus.Waived ? new Date() : null,
        waivedBy: input.status === FineStatus.Waived ? SEED_STAFF_USER_ID : null,
        waivedReason:
          input.status === FineStatus.Waived
            ? (input.waivedReason ?? 'Seed waiver for UI review')
            : null,
      }),
    );
  };

  const ensureReservation = async (input: {
    userId: string;
    bookId: string;
    queuePosition: number;
  }) => {
    const existing = await reservations.findOne({
      where: {
        userId: input.userId,
        bookId: input.bookId,
        status: ReservationStatus.Active,
      },
    });
    if (existing) {
      existing.queuePosition = input.queuePosition;
      await reservations.save(existing);
      return existing;
    }
    return reservations.save(
      reservations.create({
        userId: input.userId,
        bookId: input.bookId,
        status: ReservationStatus.Active,
        queuePosition: input.queuePosition,
      }),
    );
  };

  // --- Primary member (user@demo.local) — full UI coverage ---
  // Healthy loan
  await ensureActiveLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0002',
    dueDate: daysAgoIso(-10),
    borrowedDaysAgo: 4,
  });
  // Due soon
  await ensureActiveLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0009',
    dueDate: daysAgoIso(-2),
    borrowedDaysAgo: 12,
  });
  // Overdue active
  await ensureActiveLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0011',
    dueDate: daysAgoIso(4),
    borrowedDaysAgo: 18,
  });

  // Returned loans for history + fines
  const returnedUnpaid = await ensureReturnedLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0003',
    dueDate: daysAgoIso(10),
    borrowedDaysAgo: 25,
    returnedDaysAgo: 5,
  });
  const returnedPaid = await ensureReturnedLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0014',
    dueDate: daysAgoIso(20),
    borrowedDaysAgo: 40,
    returnedDaysAgo: 12,
  });
  const returnedWaived = await ensureReturnedLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0022',
    dueDate: daysAgoIso(15),
    borrowedDaysAgo: 30,
    returnedDaysAgo: 8,
  });

  if (returnedUnpaid.returnedAt) {
    await ensureFine({
      loan: returnedUnpaid,
      daysOverdue: 5,
      amountCents: 2500,
      status: FineStatus.Unpaid,
    });
  }
  if (returnedPaid.returnedAt) {
    await ensureFine({
      loan: returnedPaid,
      daysOverdue: 3,
      amountCents: 1500,
      status: FineStatus.Paid,
    });
  }
  if (returnedWaived.returnedAt) {
    await ensureFine({
      loan: returnedWaived,
      daysOverdue: 2,
      amountCents: 1000,
      status: FineStatus.Waived,
      waivedReason: 'First-time courtesy waiver',
    });
  }

  // --- Other members hold DDD + Midnight Library so primary member can reserve ---
  await ensureActiveLoan({
    userId: SEED_MEMBER2_USER_ID,
    barcode: 'BKLY-0007',
    dueDate: daysAgoIso(3),
    borrowedDaysAgo: 20,
  });
  await ensureActiveLoan({
    userId: SEED_MEMBER2_USER_ID,
    barcode: 'BKLY-0008',
    dueDate: daysAgoIso(-5),
    borrowedDaysAgo: 5,
  });
  await ensureActiveLoan({
    userId: SEED_MEMBER3_USER_ID,
    barcode: 'BKLY-0018',
    dueDate: daysAgoIso(-6),
    borrowedDaysAgo: 8,
  });
  await ensureActiveLoan({
    userId: SEED_MEMBER2_USER_ID,
    barcode: 'BKLY-0019',
    dueDate: daysAgoIso(-1),
    borrowedDaysAgo: 13,
  });
  await ensureActiveLoan({
    userId: SEED_MEMBER3_USER_ID,
    barcode: 'BKLY-0016',
    dueDate: daysAgoIso(-9),
    borrowedDaysAgo: 5,
  });

  await ensureReturnedLoan({
    userId: SEED_MEMBER2_USER_ID,
    barcode: 'BKLY-0004',
    dueDate: daysAgoIso(2),
    borrowedDaysAgo: 16,
    returnedDaysAgo: 1,
  });

  for (const barcode of [
    'BKLY-0003',
    'BKLY-0004',
    'BKLY-0013',
    'BKLY-0015',
    'BKLY-0010',
    'BKLY-0012',
    'BKLY-0014',
    'BKLY-0017',
    'BKLY-0020',
    'BKLY-0021',
    'BKLY-0022',
    'BKLY-0001',
    'BKLY-0005',
  ]) {
    const copy = await copyByBarcode(barcode);
    const active = await loans
      .createQueryBuilder('loan')
      .where(LOAN_BY_COPY_ID, { copyId: copy.id })
      .andWhere('loan.returned_at IS NULL')
      .getOne();
    if (
      !active &&
      copy.status !== BookCopyStatus.Available &&
      copy.status !== BookCopyStatus.Lost
    ) {
      copy.status = BookCopyStatus.Available;
      await copies.save(copy);
    } else if (active && copy.status !== BookCopyStatus.OnLoan) {
      copy.status = BookCopyStatus.OnLoan;
      await copies.save(copy);
    }
  }

  const ddd = bookByIsbn.get('9780321125217');
  const midnight = bookByIsbn.get('9780525559474');
  if (ddd) {
    await ensureReservation({
      userId: SEED_MEMBER_USER_ID,
      bookId: ddd.id,
      queuePosition: 1,
    });
    await ensureReservation({
      userId: SEED_MEMBER3_USER_ID,
      bookId: ddd.id,
      queuePosition: 2,
    });
  }
  if (midnight) {
    await ensureReservation({
      userId: SEED_MEMBER_USER_ID,
      bookId: midnight.id,
      queuePosition: 2,
    });
    await ensureReservation({
      userId: SEED_MEMBER3_USER_ID,
      bookId: midnight.id,
      queuePosition: 1,
    });
  }

  const allCopies = await copies.find({ withDeleted: false });
  for (const copy of allCopies) {
    const active = await loans
      .createQueryBuilder('loan')
      .where(LOAN_BY_COPY_ID, { copyId: copy.id })
      .andWhere('loan.returned_at IS NULL')
      .getOne();
    if (
      active &&
      copy.status !== BookCopyStatus.OnLoan &&
      copy.status !== BookCopyStatus.Lost
    ) {
      copy.status = BookCopyStatus.OnLoan;
      await copies.save(copy);
    } else if (!active && copy.status === BookCopyStatus.OnLoan) {
      copy.status = BookCopyStatus.Available;
      await copies.save(copy);
    }
  }

  console.log('Seed complete — password for all users: password123', {
    memberLogin: 'user@demo.local',
    users: userSeeds.map((s) => `${s.email} (${s.role})`),
    booksCreated,
    copiesCreated,
    memberUiCoverage: {
      activeLoans: 'healthy + due soon + overdue',
      reservations: 'queue #1 and #2',
      fines: 'unpaid + paid + waived',
      catalog: `${SEED_BOOKS.length} titles with descriptions/authors/ISBN/year`,
    },
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
