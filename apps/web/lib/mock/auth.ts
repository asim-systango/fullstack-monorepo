import type { User } from '@shared/api-client';

const STORAGE_KEY = 'food-delivery-mock-user';
const ADDRESS_KEY = 'food-delivery-mock-addresses';

export const MOCK_USERS: Array<User & { password: string; restaurant?: string }> = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@tastygo.com',
    name: 'Platform Admin',
    role: 'admin',
    password: 'Admin@123',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    email: 'customer@tastygo.com',
    name: 'Demo Customer',
    role: 'user',
    password: 'User@1234',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'hasty@tastygo.com',
    name: 'Hasty Tasty Staff',
    role: 'staff',
    password: 'Hasty@12',
    restaurant: 'Hasty Tasty',
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    email: 'burger@tastygo.com',
    name: 'Burger Barn Staff',
    role: 'staff',
    password: 'Burger@1',
    restaurant: 'Burger Barn',
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    email: 'sushi@tastygo.com',
    name: 'Sushi Sagara Staff',
    role: 'staff',
    password: 'Sushi@12',
    restaurant: 'Sushi Sagara',
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    email: 'pasta@tastygo.com',
    name: 'Pasta Piazza Staff',
    role: 'staff',
    password: 'Pasta@12',
    restaurant: 'Pasta Piazza',
  },
  {
    id: '00000000-0000-4000-8000-000000000007',
    email: 'spice@tastygo.com',
    name: 'Spice Route Staff',
    role: 'staff',
    password: 'Spice@12',
    restaurant: 'Spice Route',
  },
];

function readAddressBook(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ADDRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeAddressBook(book: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(book));
}

export function getMockSavedAddress(userId: string): string | null {
  return readAddressBook()[userId] ?? null;
}

export function saveMockDeliveryAddress(userId: string, deliveryAddress: string): void {
  const book = readAddressBook();
  book[userId] = deliveryAddress.trim();
  writeAddressBook(book);
}

function withSavedAddress(user: User): User {
  return {
    ...user,
    deliveryAddress: getMockSavedAddress(user.id),
  };
}

function toPublic(user: User & { password?: string; restaurant?: string }): User {
  return withSavedAddress({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}

export function readMockUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as User;
    return withSavedAddress(user);
  } catch {
    return null;
  }
}

export function writeMockUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function mockLogin(email: string, password: string): User {
  const found = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!found) {
    throw new Error('Invalid email or password');
  }
  const user = toPublic(found);
  writeMockUser(user);
  return user;
}

export function mockRegister(input: { name: string; email: string; password: string }): User {
  const strong =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(input.password);
  if (!strong) {
    throw new Error(
      'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character',
    );
  }

  const exists = MOCK_USERS.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase());
  if (exists) {
    throw new Error('Unable to create account with those details');
  }
  const user: User = {
    id: crypto.randomUUID(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: 'user',
    deliveryAddress: null,
  };
  writeMockUser(user);
  return user;
}

export function mockLogout(): void {
  writeMockUser(null);
}

export function mockMe(): User {
  const user = readMockUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

export function mockSaveAddress(deliveryAddress: string): User {
  const user = readMockUser();
  if (!user) throw new Error('Not authenticated');
  saveMockDeliveryAddress(user.id, deliveryAddress);
  const updated = withSavedAddress(user);
  writeMockUser(updated);
  return updated;
}

export function mockSwitchRole(role: User['role']): User {
  const found = MOCK_USERS.find((u) => u.role === role);
  if (!found) throw new Error('Unknown role');
  const user = toPublic(found);
  writeMockUser(user);
  return user;
}
