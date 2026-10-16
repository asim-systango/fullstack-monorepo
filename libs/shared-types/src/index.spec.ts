import {
  userSchema,
  apiErrorSchema,
  invitationSchema,
  balancesSchema,
  friendsPageSchema,
} from './index';

describe('userSchema', () => {
  const valid = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'user@demo.local',
    name: 'Demo User',
    role: 'user' as const,
    emailVerified: true,
  };

  it('accepts a valid user', () => {
    expect(userSchema.parse(valid)).toEqual(valid);
  });

  it('rejects non-uuid ids and invalid roles', () => {
    expect(userSchema.safeParse({ ...valid, id: 'not-uuid' }).success).toBe(false);
    expect(userSchema.safeParse({ ...valid, role: 'owner' }).success).toBe(false);
  });
});

describe('apiErrorSchema', () => {
  it('accepts a structured API error', () => {
    const body = {
      statusCode: 400,
      error: 'Bad Request',
      message: ['email must be an email'],
      details: [{ field: 'email', message: 'email must be an email' }],
    };
    expect(apiErrorSchema.parse(body)).toEqual(body);
  });

  it('accepts a string message', () => {
    expect(
      apiErrorSchema.parse({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      }).message,
    ).toBe('Invalid email or password');
  });
});

describe('invitationSchema', () => {
  it('accepts a pending invite payload', () => {
    const row = {
      id: '11111111-1111-4111-8111-111111111111',
      groupId: '22222222-2222-4222-8222-222222222222',
      groupName: 'Goa Trip',
      inviteeEmail: 'alex@demo.local',
      status: 'pending' as const,
      expiresAt: '2026-08-21T00:00:00.000Z',
      createdAt: '2026-08-14T00:00:00.000Z',
    };
    expect(invitationSchema.parse(row)).toEqual(row);
  });
});

describe('balancesSchema', () => {
  it('rejects a payload missing debts', () => {
    expect(
      balancesSchema.safeParse({
        groupId: '11111111-1111-4111-8111-111111111111',
        currency: 'INR',
        members: [],
        allClear: true,
      }).success,
    ).toBe(false);
  });
});

describe('friendsPageSchema', () => {
  it('accepts a by-group friends page', () => {
    const page = {
      view: 'groups' as const,
      items: [
        {
          group: {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'Goa Trip',
            currency: 'INR',
          },
          members: [
            {
              userId: '22222222-2222-4222-8222-222222222222',
              name: 'Alex',
              email: 'alex@demo.local',
              role: 'member' as const,
              joinedAt: '2026-08-14T00:00:00.000Z',
            },
          ],
          memberCount: 1,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      stats: { uniqueFriends: 1, sharedGroups: 1 },
      groupOptions: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Goa Trip' }],
    };
    expect(friendsPageSchema.parse(page)).toEqual(page);
  });
});
