import '../load-env';
import 'reflect-metadata';
import type { EntityManager } from 'typeorm';
import dataSource from './data-source';
import { addDays, mondayOf, parseYmd, todayUtc, yearOf } from '../common/dates';
import { LeaveBalance } from '../modules/balances/leave-balance.entity';
import { Holiday } from '../modules/holidays/holiday.entity';
import { LeaveRequest } from '../modules/leave-requests/leave-request.entity';
import type { LeaveStatus } from '../modules/leave-requests/leave-status';
import { countWorkingDays } from '../modules/leave-requests/working-days';
import { LeaveType } from '../modules/leave-types/leave-type.entity';

// run `pnpm seed` first, this needs the gateway users

const PEOPLE = {
  employee: 'user@demo.local',
  asha: 'asha@demo.local',
  rohan: 'rohan@demo.local',
  manager: 'staff@demo.local',
  admin: 'admin@demo.local',
} as const;

type PersonKey = keyof typeof PEOPLE;
type Person = { id: string; email: string; name: string; role: string };

const LEAVE_TYPES = [
  { name: 'Casual', defaultDays: 12 },
  { name: 'Sick', defaultDays: 8 },
  { name: 'Earned', defaultDays: 15 },
] as const;

type LeaveTypeName = (typeof LEAVE_TYPES)[number]['name'];

// managers apply too, admin approves their leave
const APPLICANTS: readonly PersonKey[] = ['employee', 'asha', 'rohan', 'manager'];

type RequestSeed = Readonly<{
  who: PersonKey;
  type: LeaveTypeName;
  // days from this week's monday, negative = past
  from: number;
  to: number;
  status: LeaveStatus;
  reason: string;
  comment?: string;
  softDeleted?: boolean;
}>;

const REQUESTS: readonly RequestSeed[] = [
  {
    who: 'employee',
    type: 'Casual',
    from: -28,
    to: -26,
    status: 'approved',
    reason: 'Family function in Indore',
    comment: 'Enjoy the function!',
  },
  {
    who: 'employee',
    type: 'Sick',
    from: -12,
    to: -12,
    status: 'approved',
    reason: 'Fever and a doctor visit',
  },
  {
    who: 'employee',
    type: 'Casual',
    from: 14,
    to: 15,
    status: 'pending',
    reason: "Cousin's wedding",
  },
  {
    who: 'employee',
    type: 'Earned',
    from: 21,
    to: 25,
    status: 'rejected',
    reason: 'Trip to Goa',
    comment: 'Release week — please pick another week.',
  },
  {
    who: 'employee',
    type: 'Casual',
    from: 7,
    to: 7,
    status: 'cancelled',
    reason: 'Bank paperwork',
  },
  {
    who: 'asha',
    type: 'Casual',
    from: 7,
    to: 9,
    status: 'approved',
    reason: 'Moving to a new flat',
  },
  {
    who: 'asha',
    type: 'Sick',
    from: 11,
    to: 11,
    status: 'pending',
    reason: 'Dentist appointment',
  },
  {
    who: 'rohan',
    type: 'Earned',
    from: 10,
    to: 15,
    status: 'approved',
    reason: 'Visiting parents in Jaipur',
  },
  {
    who: 'rohan',
    type: 'Casual',
    from: -19,
    to: -19,
    status: 'rejected',
    reason: 'Long weekend plan',
    comment: 'Quarter-end close — we need you that day.',
  },
  {
    who: 'rohan',
    type: 'Casual',
    from: -7,
    to: -7,
    status: 'cancelled',
    reason: 'Personal errand',
    softDeleted: true,
  },
  {
    who: 'manager',
    type: 'Casual',
    from: 16,
    to: 17,
    status: 'pending',
    reason: "Daughter's school annual day",
  },
];

const NATIONAL_HOLIDAYS = [
  { monthDay: '01-26', name: 'Republic Day' },
  { monthDay: '08-15', name: 'Independence Day' },
  { monthDay: '10-02', name: 'Gandhi Jayanti' },
  { monthDay: '12-25', name: 'Christmas' },
] as const;

// friday of the week after next
const COMPANY_HOLIDAY_OFFSET = 18;

async function loadPeople(): Promise<Record<PersonKey, Person>> {
  const emails = Object.values(PEOPLE);
  const rows: Person[] = await dataSource.query(
    'SELECT id, email, name, role FROM users WHERE email = ANY($1)',
    [emails],
  );
  const byEmail = new Map(rows.map((row) => [row.email, row]));
  const missing = emails.filter((email) => !byEmail.has(email));
  if (missing.length > 0) {
    throw new Error(
      `Missing gateway users: ${missing.join(', ')}. Run \`pnpm seed\` first, then \`pnpm seed:api\`.`,
    );
  }
  const people = {} as Record<PersonKey, Person>;
  for (const key of Object.keys(PEOPLE) as PersonKey[]) {
    people[key] = byEmail.get(PEOPLE[key]) as Person;
  }
  return people;
}

type HolidayRow = Pick<Holiday, 'date' | 'name'>;

function holidayRows(monday: string, years: readonly number[]): HolidayRow[] {
  const rows: HolidayRow[] = years.flatMap((year) =>
    NATIONAL_HOLIDAYS.map((h) => ({ date: `${year}-${h.monthDay}`, name: h.name })),
  );
  const companyDay = addDays(monday, COMPANY_HOLIDAY_OFFSET);
  if (!rows.some((row) => row.date === companyDay)) {
    rows.push({ date: companyDay, name: 'Company Foundation Day' });
  }
  return rows;
}

// a request can't cross into next year
function clipToYear(start: string, end: string): string {
  return yearOf(end) === yearOf(start) ? end : `${yearOf(start)}-12-31`;
}

function decidedAtFor(start: string): Date {
  const twoDaysBefore = parseYmd(addDays(start, -2));
  const now = new Date();
  return twoDaysBefore < now ? twoDaysBefore : now;
}

async function seedDomain(m: EntityManager, people: Record<PersonKey, Person>) {
  await m.query(
    'TRUNCATE TABLE "leave_requests", "leave_balances", "holidays", "leave_types"',
  );

  const monday = mondayOf(todayUtc());
  const thisYear = yearOf(monday);
  const years = [thisYear, thisYear + 1];

  const types = await m.save(
    LeaveType,
    LEAVE_TYPES.map((t) =>
      m.create(LeaveType, { name: t.name, defaultDays: t.defaultDays }),
    ),
  );
  const typeByName = new Map(types.map((t) => [t.name, t]));

  const holidays = await m.save(
    Holiday,
    holidayRows(monday, years).map((h) => m.create(Holiday, h)),
  );
  const holidayDates = new Set(holidays.map((h) => h.date));

  const requests: LeaveRequest[] = [];
  const toSoftDelete: LeaveRequest[] = [];
  for (const seed of REQUESTS) {
    const startDate = addDays(monday, seed.from);
    const endDate = clipToYear(startDate, addDays(monday, seed.to));
    const days = countWorkingDays(startDate, endDate, holidayDates);
    if (days === 0) {
      console.warn(
        `Skipped "${seed.reason}": no working days between ${startDate} and ${endDate}`,
      );
      continue;
    }
    const requester = people[seed.who];
    const decided = seed.status === 'approved' || seed.status === 'rejected';
    // manager decides employee leave, admin decides manager leave
    const decider = requester.role === 'staff' ? people.admin : people.manager;
    const request = m.create(LeaveRequest, {
      userId: requester.id,
      leaveTypeId: (typeByName.get(seed.type) as LeaveType).id,
      startDate,
      endDate,
      days,
      reason: seed.reason,
      status: seed.status,
      managerId: decided ? decider.id : null,
      managerComment: decided ? (seed.comment ?? null) : null,
      decidedAt: decided ? decidedAtFor(startDate) : null,
    });
    requests.push(request);
    if (seed.softDeleted) toSoftDelete.push(request);
  }
  await m.save(LeaveRequest, requests);
  if (toSoftDelete.length > 0) {
    await m.softDelete(
      LeaveRequest,
      toSoftDelete.map((r) => r.id),
    );
  }

  const balances: LeaveBalance[] = [];
  for (const who of APPLICANTS) {
    const person = people[who];
    for (const type of types) {
      for (const year of years) {
        const usedDays = requests
          .filter(
            (r) =>
              r.userId === person.id &&
              r.leaveTypeId === type.id &&
              r.status === 'approved' &&
              yearOf(r.startDate) === year,
          )
          .reduce((sum, r) => sum + r.days, 0);
        balances.push(
          m.create(LeaveBalance, {
            userId: person.id,
            leaveTypeId: type.id,
            year,
            totalDays: type.defaultDays,
            usedDays,
          }),
        );
      }
    }
  }
  await m.save(LeaveBalance, balances);

  const byStatus = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log('Leave seed complete', {
    weekOf: monday,
    leaveTypes: types.length,
    holidays: holidays.length,
    balances: balances.length,
    requests: requests.length,
    byStatus,
    softDeleted: toSoftDelete.length,
  });
}

async function seed() {
  await dataSource.initialize();
  try {
    const people = await loadPeople();
    await dataSource.transaction((m) => seedDomain(m, people));
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
