/**
 * Centralised UI Error & Status Messages
 *
 * All user-facing notification, alert, and error strings are centralized
 * here to prevent magic string duplication and allow easy i18n/localization.
 */

export const AUTH_ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Please provide both email address and password.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  SERVER_ERROR: 'Something went wrong. Please check your connection or try again later.',
  UNEXPECTED_ERROR: 'Something went wrong. Please try again later.',
} as const;

export const SYSTEM_MESSAGES = {
  GENERIC_SOMETHING_WENT_WRONG: 'Something went wrong. Please try again later.',
  NETWORK_CONNECTION_ERROR:
    'Unable to connect to server. Please check your network connection.',
} as const;

export const SUPER_ADMIN_MESSAGES = {
  TITLE: 'Platform Super Admin Console',
  SUBTITLE: 'Cross-tenant administration, organization overview, and platform metrics.',
  TOTAL_ORGANIZATIONS: 'Total Organizations',
  TOTAL_USERS: 'Total Platform Users',
  PENDING_INVITES: 'Pending Invites',
  TOTAL_REQUESTS: 'Organization Requests',
} as const;

export interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  adminEmail: string;
  usersCount: number;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
}

export const MOCK_ORGANIZATIONS: OrganizationItem[] = [
  {
    id: 'org-1',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    adminEmail: 'admin@acme.com',
    usersCount: 24,
    status: 'ACTIVE',
    createdAt: '2026-01-15',
  },
  {
    id: 'org-2',
    name: 'Apex FinTech Solutions',
    slug: 'apex-fintech',
    adminEmail: 'sarah.j@apexfin.com',
    usersCount: 58,
    status: 'ACTIVE',
    createdAt: '2026-02-01',
  },
  {
    id: 'org-3',
    name: 'CloudScale Systems',
    slug: 'cloudscale',
    adminEmail: 'devops@cloudscale.io',
    usersCount: 112,
    status: 'ACTIVE',
    createdAt: '2026-03-10',
  },
  {
    id: 'org-4',
    name: 'Starlight Tech Inc',
    slug: 'starlight',
    adminEmail: 'm.kahn@starlight.net',
    usersCount: 14,
    status: 'PENDING',
    createdAt: '2026-04-02',
  },
];
