import type { User } from '@shared/api-client';
import { DEMO_USER_IDS } from './data';

const STORAGE_KEY = 'food-delivery-mock-user';

export const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: DEMO_USER_IDS.user,
    email: 'user@demo.local',
    name: 'Tanishq Rao',
    role: 'user',
    password: 'password123',
  },
  {
    id: DEMO_USER_IDS.staff,
    email: 'staff@demo.local',
    name: 'Hasty Tasty Team',
    role: 'staff',
    password: 'password123',
  },
  {
    id: DEMO_USER_IDS.admin,
    email: 'admin@demo.local',
    name: 'Platform Admin',
    role: 'admin',
    password: 'password123',
  },
];

function toPublic(user: User & { password?: string }): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}

export function readMockUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
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
  const exists = MOCK_USERS.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase());
  if (exists) {
    throw new Error('Unable to create account with those details');
  }
  const user: User = {
    id: crypto.randomUUID(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: 'user',
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

/** Quick switch between demo roles (mock mode only). */
export function mockSwitchRole(role: User['role']): User {
  const found = MOCK_USERS.find((u) => u.role === role);
  if (!found) throw new Error('Unknown role');
  const user = toPublic(found);
  writeMockUser(user);
  return user;
}
