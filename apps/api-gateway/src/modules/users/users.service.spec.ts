import { Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

function makeUser(overrides: Partial<User> = {}): User {
  const user: User = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    passwordHash: 'hash',
    name: 'Demo',
    role: 'user',
    emailVerifiedAt: null,
    lastLoginAt: null,
    otpHash: null,
    otpExpiresAt: null,
    otpAttempts: 0,
    otpSentAt: null,
    otpPurpose: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return Object.assign(user, overrides);
}

describe('UsersService', () => {
  const repo = {
    findOne: jest.fn(),
    create: jest.fn((v: Partial<User>) => v),
    save: jest.fn(async (v: User) => v),
    delete: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(repo as never);
  });

  it('findByEmail lowercases the email', async () => {
    const user = makeUser();
    repo.findOne.mockResolvedValue(user);

    await expect(service.findByEmail('User@Example.com')).resolves.toBe(user);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
  });

  it('findById looks up by id', async () => {
    const user = makeUser();
    repo.findOne.mockResolvedValue(user);

    await expect(service.findById(user.id)).resolves.toBe(user);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
  });

  it('create lowercases email and defaults role to user', async () => {
    repo.save.mockImplementation(async (v) => makeUser({ ...v }));

    const created = await service.create({
      email: 'New@Example.com',
      passwordHash: 'hash',
      name: 'New',
    });

    expect(repo.create).toHaveBeenCalledWith({
      email: 'new@example.com',
      passwordHash: 'hash',
      name: 'New',
      role: 'user',
      emailVerifiedAt: null,
      otpAttempts: 0,
    });
    expect(created.email).toBe('new@example.com');
  });

  it('create keeps an explicit emailVerifiedAt', async () => {
    const verifiedAt = new Date('2026-01-01T00:00:00.000Z');
    repo.save.mockImplementation(async (v) => makeUser({ ...v }));

    await service.create({
      email: 'new@example.com',
      passwordHash: 'hash',
      name: 'New',
      role: 'staff',
      emailVerifiedAt: verifiedAt,
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'staff',
        emailVerifiedAt: verifiedAt,
      }),
    );
  });

  it('toPublic omits passwordHash', () => {
    const user = makeUser({ passwordHash: 'secret' });
    expect(service.toPublic(user)).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: false,
    });
  });

  it('toPublic reports verified email when emailVerifiedAt is set', () => {
    const user = makeUser({ emailVerifiedAt: new Date() });
    expect(service.toPublic(user).emailVerified).toBe(true);
  });

  it('save persists the entity', async () => {
    const user = makeUser();
    await expect(service.save(user)).resolves.toEqual(user);
    expect(repo.save).toHaveBeenCalledWith(user);
  });

  it('deleteById deletes by id', async () => {
    repo.delete.mockResolvedValue(undefined);
    await service.deleteById('abc');
    expect(repo.delete).toHaveBeenCalledWith({ id: 'abc' });
  });

  it('updateProfile updates email and name', async () => {
    const user = makeUser();
    repo.findOne.mockResolvedValue(user);
    repo.save.mockResolvedValue(user);

    const updated = await service.updateProfile(user.id, {
      email: 'New@Example.com',
      name: 'Renamed',
    });

    expect(updated.email).toBe('new@example.com');
    expect(updated.name).toBe('Renamed');
  });

  it('updateProfile can patch name only', async () => {
    const user = makeUser({ email: 'keep@example.com' });
    repo.findOne.mockResolvedValue(user);
    repo.save.mockResolvedValue(user);

    await service.updateProfile(user.id, { name: 'OnlyName' });
    expect(user.email).toBe('keep@example.com');
    expect(user.name).toBe('OnlyName');
  });

  it('updateProfile throws when the user is missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(
      service.updateProfile('missing', { name: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updatePasswordHash stores the new hash', async () => {
    const user = makeUser();
    repo.findOne.mockResolvedValue(user);
    await service.updatePasswordHash(user.id, 'new-hash');
    expect(user.passwordHash).toBe('new-hash');
    expect(repo.save).toHaveBeenCalledWith(user);
  });

  it('updatePasswordHash throws when the user is missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(
      service.updatePasswordHash('missing', 'hash'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('touchLastLogin writes lastLoginAt', async () => {
    repo.update.mockResolvedValue(undefined);
    await service.touchLastLogin('abc');
    expect(repo.update).toHaveBeenCalledWith(
      { id: 'abc' },
      { lastLoginAt: expect.any(Date) },
    );
  });

  it('updateRole changes the role', async () => {
    const user = makeUser();
    repo.findOne.mockResolvedValue(user);
    await service.updateRole(user.id, 'staff');
    expect(user.role).toBe('staff');
  });

  it('updateRole throws when the user is missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.updateRole('missing', 'admin')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('countByRole delegates to the repository', async () => {
    repo.count.mockResolvedValue(2);
    await expect(service.countByRole('user')).resolves.toBe(2);
    expect(repo.count).toHaveBeenCalledWith({ where: { role: 'user' } });
  });

  it('rollbackCreatedUser deletes the user', async () => {
    repo.delete.mockResolvedValue(undefined);
    await service.rollbackCreatedUser('abc');
    expect(repo.delete).toHaveBeenCalledWith({ id: 'abc' });
  });

  it('rollbackCreatedUser logs when delete fails', async () => {
    repo.delete.mockRejectedValue(new Error('constraint'));
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    await service.rollbackCreatedUser('abc');
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('rollbackCreatedUser stringifies non-Error failures', async () => {
    repo.delete.mockRejectedValue('constraint');
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    await service.rollbackCreatedUser('abc');
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('userId=abc'),
      'constraint',
    );
    error.mockRestore();
  });
});
