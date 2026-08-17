import { UsersService } from './users.service';
import { User, Role } from './user.entity';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    passwordHash: 'hash',
    firstName: 'Demo',
    lastName: 'User',
    name: 'Demo User',
    phone: '+1234567890',
    role: Role.PATIENT,
    isActive: true,
    emailVerified: true,
    hashedRefreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

describe('UsersService', () => {
  const repo = {
    findOne: jest.fn(),
    create: jest.fn((v: Partial<User>) => v),
    save: jest.fn(async (v: User) => v),
    update: jest.fn(),
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

  it('findByPhone looks up by phone number', async () => {
    const user = makeUser();
    repo.findOne.mockResolvedValue(user);

    await expect(service.findByPhone('+1234567890')).resolves.toBe(user);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { phone: '+1234567890' },
    });
  });

  it('findById looks up by id', async () => {
    const user = makeUser();
    repo.findOne.mockResolvedValue(user);

    await expect(service.findById(user.id)).resolves.toBe(user);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
  });

  it('create lowercases email and defaults role to PATIENT', async () => {
    repo.save.mockImplementation(async (v) => makeUser({ ...v }));

    const created = await service.create({
      email: 'New@Example.com',
      passwordHash: 'hash',
      firstName: 'New',
      lastName: 'User',
      name: 'New User',
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        passwordHash: 'hash',
        firstName: 'New',
        lastName: 'User',
        name: 'New User',
        role: Role.PATIENT,
      }),
    );
    expect(created.email).toBe('new@example.com');
  });

  it('create generates fallback name from email if name and names omitted', async () => {
    repo.save.mockImplementation(async (v) => makeUser({ ...v }));

    await service.create({
      email: 'john.doe@example.com',
      passwordHash: 'hash',
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'john.doe',
      }),
    );
  });

  it('updateRefreshToken updates the token in repository', async () => {
    await service.updateRefreshToken('user-1', 'hashed-token');
    expect(repo.update).toHaveBeenCalledWith('user-1', {
      hashedRefreshToken: 'hashed-token',
    });
  });

  it('updatePassword updates the password in repository', async () => {
    await service.updatePassword('user-1', 'new-hash');
    expect(repo.update).toHaveBeenCalledWith('user-1', { passwordHash: 'new-hash' });
  });

  describe('updateProfile', () => {
    it('returns null if user does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      const res = await service.updateProfile('missing-id', { firstName: 'Test' });
      expect(res).toBeNull();
    });

    it('updates user profile fields and recalculates name', async () => {
      const user = makeUser({ firstName: 'Old', lastName: 'Name', name: 'Old Name' });
      repo.findOne.mockResolvedValue(user);
      repo.save.mockImplementation(async (u) => u);

      const res = await service.updateProfile(user.id, {
        firstName: 'New',
        lastName: 'Updated',
        phone: '+999999999',
        avatarUrl: 'http://avatar.png',
      });

      expect(res?.firstName).toBe('New');
      expect(res?.lastName).toBe('Updated');
      expect(res?.name).toBe('New Updated');
      expect(res?.phone).toBe('+999999999');
      expect(res?.avatarUrl).toBe('http://avatar.png');
    });
  });

  describe('toPublic', () => {
    it('omits passwordHash and handles missing names/phone/avatar', () => {
      const user = makeUser({
        passwordHash: 'secret',
        firstName: undefined,
        lastName: undefined,
        name: undefined,
        phone: undefined,
        avatarUrl: undefined,
      });

      const publicUser = service.toPublic(user);
      expect(publicUser.id).toBe(user.id);
      expect(publicUser.firstName).toBe('user');
      expect(publicUser.lastName).toBe('');
      expect(publicUser.phone).toBe('');
      expect(publicUser.avatarUrl).toBeNull();
      expect('passwordHash' in publicUser).toBe(false);
    });
  });
});
