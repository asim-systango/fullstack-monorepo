import { UsersService } from './users.service';
import { User } from './user.entity';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    passwordHash: 'hash',
    name: 'Demo',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('UsersService', () => {
  const repo = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    create: jest.fn((v: Partial<User>) => v),
    save: jest.fn(async (v: User) => v),
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

  it('findAll returns users ordered by createdAt DESC', async () => {
    const users = [makeUser()];
    repo.find.mockResolvedValue(users);

    await expect(service.findAll()).resolves.toBe(users);
    expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });

  it('listPublic maps users through toPublic', async () => {
    const users = [makeUser(), makeUser({ id: '22222222-2222-2222-2222-222222222222' })];
    repo.find.mockResolvedValue(users);

    await expect(service.listPublic()).resolves.toEqual([
      service.toPublic(users[0]!),
      service.toPublic(users[1]!),
    ]);
  });

  it('countByRole counts users with the given role', async () => {
    repo.count.mockResolvedValue(2);

    await expect(service.countByRole('staff')).resolves.toBe(2);
    expect(repo.count).toHaveBeenCalledWith({ where: { role: 'staff' } });
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
    });
    expect(created.email).toBe('new@example.com');
  });

  it('toPublic omits passwordHash', () => {
    const user = makeUser({ passwordHash: 'secret' });
    expect(service.toPublic(user)).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  });
});
