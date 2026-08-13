export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'admin' | 'user' | 'staff';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  phone?: string;
  avatarUrl?: string | null;
  role: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  biography?: string;
  profileImage?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user: AuthUser;
  message?: string;
  requiresApproval?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
