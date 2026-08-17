export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | null;
  isPasswordChangeRequired: boolean;
  lastLoginAt: number;
}

export interface OrganizationContext {
  id: string;
  name: string;
  slug: string;
  primaryDomain: string;
  logoUrl?: string;
}

export interface LoginResponse {
  accessToken: string | null;
  passwordResetToken?: string | null;
  isPasswordChangeRequired?: boolean;
  tokenType?: string;
  expiresIn?: string;
  user: UserProfile;
  organization: OrganizationContext | null;
  message?: string;
}
