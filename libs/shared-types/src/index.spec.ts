import { userSchema, apiErrorSchema } from './index';

describe('userSchema', () => {
  const valid = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'user@demo.local',
    name: 'Demo User',
    role: 'user' as const,
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
