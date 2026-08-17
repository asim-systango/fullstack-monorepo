import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { SEED_IDS } from './seed-ids';
import { User } from '../modules/users/user.entity';
import { Group } from '../modules/groups/group.entity';
import { GroupMember } from '../modules/groups/group-member.entity';
import { Expense } from '../modules/expenses/expense.entity';
import { Share } from '../modules/expenses/share.entity';
import { Settlement } from '../modules/settlements/settlement.entity';

async function upsertUser(
  repo: ReturnType<typeof dataSource.getRepository<User>>,
  row: { id: string; email: string; name: string; role: User['role'] },
  passwordHash: string,
) {
  let user = await repo.findOne({ where: { email: row.email } });
  if (!user) {
    user = repo.create({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      passwordHash,
      emailVerifiedAt: new Date(),
    });
    await repo.save(user);
  } else if (!user.emailVerifiedAt) {
    user.emailVerifiedAt = new Date();
    await repo.save(user);
  }
  return user;
}

async function seed() {
  await dataSource.initialize();
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = dataSource.getRepository(User);
  const groups = dataSource.getRepository(Group);
  const members = dataSource.getRepository(GroupMember);
  const expenses = dataSource.getRepository(Expense);
  const shares = dataSource.getRepository(Share);
  const settlements = dataSource.getRepository(Settlement);

  const admin = await upsertUser(
    users,
    {
      id: SEED_IDS.users.admin,
      email: 'admin@demo.local',
      name: 'Demo Admin',
      role: 'admin',
    },
    passwordHash,
  );
  const demoUser = await upsertUser(
    users,
    {
      id: SEED_IDS.users.user,
      email: 'user@demo.local',
      name: 'Demo User',
      role: 'user',
    },
    passwordHash,
  );
  const staff = await upsertUser(
    users,
    {
      id: SEED_IDS.users.staff,
      email: 'staff@demo.local',
      name: 'Demo Staff',
      role: 'staff',
    },
    passwordHash,
  );
  const alex = await upsertUser(
    users,
    {
      id: SEED_IDS.users.alex,
      email: 'alex@demo.local',
      name: 'Alex Kim',
      role: 'user',
    },
    passwordHash,
  );

  async function ensureGroup(
    id: string,
    name: string,
    currency: string,
    createdByUserId: string,
  ) {
    let group = await groups.findOne({ where: { id } });
    if (!group) {
      group = await groups.save(groups.create({ id, name, currency, createdByUserId }));
    }
    return group;
  }

  async function ensureMember(groupId: string, userId: string, role: 'admin' | 'member') {
    const existing = await members.findOne({ where: { groupId, userId } });
    if (!existing) {
      await members.save(members.create({ groupId, userId, role }));
    }
  }

  const trip = await ensureGroup(SEED_IDS.groups.trip, 'Goa Trip 2025', 'INR', staff.id);
  const apartment = await ensureGroup(
    SEED_IDS.groups.apartment,
    'Shared Apartment',
    'INR',
    staff.id,
  );

  for (const [groupId, userId, role] of [
    [trip.id, staff.id, 'admin'],
    [trip.id, demoUser.id, 'member'],
    [trip.id, alex.id, 'member'],
    [apartment.id, staff.id, 'admin'],
    [apartment.id, demoUser.id, 'member'],
  ] as const) {
    await ensureMember(groupId, userId, role);
  }

  const expenseSeeds = [
    {
      groupId: trip.id,
      description: 'Beach resort booking',
      amountCents: 1500000,
      payerUserId: staff.id,
      createdByUserId: staff.id,
      category: 'Accommodation',
      splits: [
        [staff.id, 500000],
        [demoUser.id, 500000],
        [alex.id, 500000],
      ],
    },
    {
      groupId: trip.id,
      description: 'Dinner at Fishermans Wharf',
      amountCents: 450000,
      payerUserId: demoUser.id,
      createdByUserId: demoUser.id,
      category: 'Food',
      splits: [
        [staff.id, 150000],
        [demoUser.id, 150000],
        [alex.id, 150000],
      ],
    },
    {
      groupId: trip.id,
      description: 'Scooter rental',
      amountCents: 120000,
      payerUserId: alex.id,
      createdByUserId: alex.id,
      category: 'Transport',
      splits: [
        [staff.id, 40000],
        [demoUser.id, 40000],
        [alex.id, 40000],
      ],
    },
    {
      groupId: apartment.id,
      description: 'Monthly rent — March',
      amountCents: 3000000,
      payerUserId: staff.id,
      createdByUserId: staff.id,
      category: 'Rent',
      splits: [
        [staff.id, 1500000],
        [demoUser.id, 1500000],
      ],
    },
    {
      groupId: apartment.id,
      description: 'Electricity bill',
      amountCents: 85000,
      payerUserId: demoUser.id,
      createdByUserId: demoUser.id,
      category: 'Utilities',
      splits: [
        [staff.id, 42500],
        [demoUser.id, 42500],
      ],
    },
    {
      groupId: apartment.id,
      description: 'Groceries — BigBasket',
      amountCents: 320000,
      payerUserId: staff.id,
      createdByUserId: staff.id,
      category: 'Groceries',
      splits: [
        [staff.id, 160000],
        [demoUser.id, 160000],
      ],
    },
  ] as const;

  for (const row of expenseSeeds) {
    const exists = await expenses.findOne({
      where: { groupId: row.groupId, description: row.description },
    });
    if (exists) continue;

    const expense = await expenses.save(
      expenses.create({
        groupId: row.groupId,
        description: row.description,
        amountCents: row.amountCents,
        payerUserId: row.payerUserId,
        createdByUserId: row.createdByUserId,
        category: row.category,
        expenseDate: new Date(),
      }),
    );

    for (const [userId, amountCents] of row.splits) {
      await shares.save(shares.create({ expenseId: expense.id, userId, amountCents }));
    }
  }

  const settlementExists = await settlements.findOne({
    where: { groupId: apartment.id, payerUserId: demoUser.id },
  });
  if (!settlementExists) {
    await settlements.save(
      settlements.create({
        groupId: apartment.id,
        payerUserId: demoUser.id,
        payeeUserId: staff.id,
        createdByUserId: demoUser.id,
        amountCents: 500000,
        note: 'Partial rent payment',
        settledAt: new Date(),
      }),
    );
  }

  const tripSettleExists = await settlements.findOne({
    where: { groupId: trip.id, payerUserId: alex.id },
  });
  if (!tripSettleExists) {
    await settlements.save(
      settlements.create({
        groupId: trip.id,
        payerUserId: alex.id,
        payeeUserId: staff.id,
        createdByUserId: alex.id,
        amountCents: 40000,
        note: 'Scooter share',
        settledAt: new Date(),
      }),
    );
  }

  console.log('Seed complete — password for all demo users: password123');
  console.log('Demo logins:', [admin.email, demoUser.email, staff.email, alex.email]);

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
