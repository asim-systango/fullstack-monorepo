import { validate } from 'class-validator';
import { LoginDto, RegisterDto } from './auth.dto';

describe('RegisterDto', () => {
  it('accepts a strong password payload', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'user@example.com',
      password: 'User@1234',
      name: 'Demo',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects weak passwords and invalid emails', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'not-an-email',
      password: 'password123',
      name: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((e) => e.property).sort()).toEqual(
      expect.arrayContaining(['email', 'password', 'name']),
    );
  });

  it('rejects password without special character', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'user@example.com',
      password: 'Password1',
      name: 'Demo',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});

describe('LoginDto', () => {
  it('accepts a valid payload', async () => {
    const dto = Object.assign(new LoginDto(), {
      email: 'user@example.com',
      password: 'x',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects empty password', async () => {
    const dto = Object.assign(new LoginDto(), {
      email: 'user@example.com',
      password: '',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
