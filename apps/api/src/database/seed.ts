import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { Book } from '../modules/books/book.entity';
import { BookCopy } from '../modules/books/book-copy.entity';
import { BookCopyStatus } from '../modules/books/enums/book-copy-status.enum';
import { CheckoutRequest } from '../modules/checkout-requests/checkout-request.entity';
import { CheckoutRequestStatus } from '../modules/checkout-requests/enums/checkout-request-status.enum';
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
    title: "Build, Don't Talk",
    author: 'Raj Shamani',
    isbn: '9780143465874',
    description:
      "Build, Don't Talk is a practical guide to personal growth, career development, and building a successful life. Raj Shamani shares lessons on taking action instead of just talking about goals, developing the right mindset, improving communication, building relationships, handling money, and creating opportunities. The book focuses on practical lessons that can be applied in everyday life, especially for young people who want to grow personally and professionally.",
    publishedYear: 2024,
    copies: [
      {
        barcode: 'BKLY-0023',
        status: BookCopyStatus.Available,
        acquiredAt: '2025-01-15',
      },
      {
        barcode: 'BKLY-0024',
        status: BookCopyStatus.Available,
        acquiredAt: '2025-01-15',
      },
    ],
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '9780062315007',
    description:
      'The Alchemist is an inspiring story about following your dreams and discovering your true purpose in life. It follows Santiago, a young shepherd who decides to pursue a recurring dream that leads him on a journey across different places. Along the way, he learns about courage, faith, perseverance, love, and the importance of listening to your heart. The book encourages readers to believe in their dreams and have the courage to pursue what they truly want.',
    publishedYear: 1993,
    copies: [
      {
        barcode: 'BKLY-0025',
        status: BookCopyStatus.Available,
        acquiredAt: '2025-01-15',
      },
      {
        barcode: 'BKLY-0026',
        status: BookCopyStatus.Available,
        acquiredAt: '2025-01-15',
      },
    ],
  },
  {
    title: 'Zero to One',
    author: 'Peter Thiel with Blake Masters',
    isbn: '9780804139298',
    description:
      'Zero to One is a book about startups, innovation, entrepreneurship, and building the future. Peter Thiel explains how successful companies create something genuinely new instead of simply copying what already exists. The book explores ideas such as innovation, competition, monopoly, technology, business strategy, and the importance of thinking independently. It encourages entrepreneurs to focus on creating unique value and moving from zero to one by bringing something new into the world.',
    publishedYear: 2014,
    copies: [
      {
        barcode: 'BKLY-0027',
        status: BookCopyStatus.Available,
        acquiredAt: '2025-01-15',
      },
      {
        barcode: 'BKLY-0028',
        status: BookCopyStatus.Available,
        acquiredAt: '2025-01-15',
      },
    ],
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    description:
      'Atomic Habits explains how small, consistent changes can lead to remarkable results over time. James Clear presents a practical framework for building good habits, breaking bad ones, and creating an environment that supports positive behavior. The book focuses on concepts such as identity-based habits, habit stacking, making good habits easy and rewarding, and understanding the systems behind our daily actions. It shows that meaningful transformation does not require drastic changes—small improvements, repeated consistently, can create significant long-term results.',
    publishedYear: 2018,
    copies: [
      {
        barcode: 'BKLY-0015',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-08-01',
      },
      {
        barcode: 'BKLY-0016',
        status: BookCopyStatus.OnLoan,
        acquiredAt: '2024-08-01',
      },
    ],
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    isbn: '9780399590504',
    description:
      'Educated is a memoir about growing up in a strict, isolated household and later pursuing an education that transformed the author’s life. Tara Westover describes her childhood, family dynamics, struggle for knowledge, and the difficult choice between loyalty and independence. The book explores identity, memory, family, resilience, and the power of education to open new possibilities.',
    publishedYear: 2018,
    copies: [
      {
        barcode: 'BKLY-0030',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-09-01',
      },
    ],
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    description:
      'Clean Code is a practical guide to writing software that is readable, maintainable, and easier to change. Robert C. Martin explains naming, functions, comments, formatting, error handling, and testing through examples. The book focuses on professional craftsmanship and the habits that keep a codebase healthy over time.',
    publishedYear: 2008,
    copies: [
      {
        barcode: 'BKLY-0031',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-09-01',
      },
    ],
  },
  {
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    isbn: '9780465050659',
    description:
      'The Design of Everyday Things explains why some products feel obvious to use and others cause constant frustration. Don Norman introduces affordances, signifiers, feedback, and human-centered design. The book shows how good design matches how people actually think and behave.',
    publishedYear: 2013,
    copies: [
      {
        barcode: 'BKLY-0032',
        status: BookCopyStatus.Available,
        acquiredAt: '2024-09-01',
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
  const checkoutRequests = dataSource.getRepository(CheckoutRequest);
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
      booksCreated += 1;
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

  const keepIsbns = new Set(SEED_BOOKS.map((row) => row.isbn));
  const extras = await books.find();
  for (const extra of extras) {
    if (!keepIsbns.has(extra.isbn)) {
      await books.softRemove(extra);
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

  const resetMemberActivity = async (userId: string) => {
    await checkoutRequests.delete({ userId });
    await fines.delete({ userId });
    await reservations.delete({ userId });
    const memberLoans = await loans.find({ where: { userId } });
    for (const loan of memberLoans) {
      await loans.delete({ id: loan.id });
    }
  };

  const ensureFulfilledRequest = async (loan: Loan) => {
    const existing = await checkoutRequests.findOne({ where: { loanId: loan.id } });
    if (existing) return existing;
    return checkoutRequests.save(
      checkoutRequests.create({
        userId: loan.userId,
        bookId: loan.bookId,
        status: CheckoutRequestStatus.Fulfilled,
        loanId: loan.id,
        bookCopyId: loan.bookCopyId,
        issuedBy: SEED_STAFF_USER_ID,
        fulfilledAt: loan.borrowedAt,
      }),
    );
  };

  const ensurePendingRequest = async (userId: string, bookId: string) => {
    const existing = await checkoutRequests.findOne({
      where: { userId, bookId, status: CheckoutRequestStatus.Pending },
    });
    if (existing) return existing;
    return checkoutRequests.save(
      checkoutRequests.create({
        userId,
        bookId,
        status: CheckoutRequestStatus.Pending,
      }),
    );
  };

  // --- Primary member (user@demo.local) — one coherent story across pages ---
  await resetMemberActivity(SEED_MEMBER_USER_ID);

  const healthyLoan = await ensureActiveLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0024',
    dueDate: daysAgoIso(-10),
    borrowedDaysAgo: 4,
  });
  const dueSoonLoan = await ensureActiveLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0026',
    dueDate: daysAgoIso(-2),
    borrowedDaysAgo: 12,
  });
  const overdueLoan = await ensureActiveLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0028',
    dueDate: daysAgoIso(4),
    borrowedDaysAgo: 18,
  });

  await ensureFulfilledRequest(healthyLoan);
  await ensureFulfilledRequest(dueSoonLoan);
  await ensureFulfilledRequest(overdueLoan);

  await ensureFine({
    loan: overdueLoan,
    daysOverdue: 4,
    amountCents: 200,
    status: FineStatus.Unpaid,
  });

  const returnedPaid = await ensureReturnedLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0031',
    dueDate: daysAgoIso(20),
    borrowedDaysAgo: 40,
    returnedDaysAgo: 12,
  });
  const returnedWaived = await ensureReturnedLoan({
    userId: SEED_MEMBER_USER_ID,
    barcode: 'BKLY-0030',
    dueDate: daysAgoIso(15),
    borrowedDaysAgo: 30,
    returnedDaysAgo: 8,
  });

  if (returnedPaid.returnedAt) {
    await ensureFine({
      loan: returnedPaid,
      daysOverdue: 3,
      amountCents: 150,
      status: FineStatus.Paid,
    });
  }
  if (returnedWaived.returnedAt) {
    await ensureFine({
      loan: returnedWaived,
      daysOverdue: 2,
      amountCents: 100,
      status: FineStatus.Waived,
      waivedReason: 'First-time courtesy waiver',
    });
  }

  const design = bookByIsbn.get('9780465050659');
  if (design) {
    await ensurePendingRequest(SEED_MEMBER_USER_ID, design.id);
  }

  // --- Other members hold Atomic Habits so primary member can reserve ---
  await ensureActiveLoan({
    userId: SEED_MEMBER2_USER_ID,
    barcode: 'BKLY-0015',
    dueDate: daysAgoIso(-5),
    borrowedDaysAgo: 5,
  });
  await ensureActiveLoan({
    userId: SEED_MEMBER3_USER_ID,
    barcode: 'BKLY-0016',
    dueDate: daysAgoIso(-9),
    borrowedDaysAgo: 5,
  });

  for (const barcode of [
    'BKLY-0015',
    'BKLY-0016',
    'BKLY-0023',
    'BKLY-0024',
    'BKLY-0025',
    'BKLY-0026',
    'BKLY-0027',
    'BKLY-0028',
    'BKLY-0030',
    'BKLY-0031',
    'BKLY-0032',
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

  const atomic = bookByIsbn.get('9780735211292');
  if (atomic) {
    await ensureReservation({
      userId: SEED_MEMBER_USER_ID,
      bookId: atomic.id,
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
      activeLoans: 'healthy + due soon + overdue (same titles as issued requests)',
      checkoutRequests: '1 pending + 3 issued',
      reservations: 'Atomic Habits queue #1',
      fines: 'overdue unpaid + Clean Code paid + Educated waived',
      catalog: `${SEED_BOOKS.length} titles with descriptions/authors/ISBN/year`,
    },
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
