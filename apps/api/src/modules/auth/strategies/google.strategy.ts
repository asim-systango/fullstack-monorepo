import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { loadApiEnv } from '../../../common/env';
import { AuthService } from '../auth.service';
import type { User } from '../../users';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    const env = loadApiEnv();
    const callbackURL =
      env.GOOGLE_CALLBACK_URL ??
      `${env.APP_PUBLIC_URL.replace(/\/$/, '')}/api/auth/google/callback`;

    super({
      clientID: env.GOOGLE_CLIENT_ID || 'google-not-configured',
      clientSecret: env.GOOGLE_CLIENT_SECRET || 'google-not-configured',
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    const given = profile.name?.givenName?.trim() ?? '';
    const family = profile.name?.familyName?.trim() ?? '';
    let name = profile.displayName?.trim() ?? '';
    if (!name) name = `${given} ${family}`.trim();
    if (!name) name = email.split('@')[0] ?? 'user';

    return this.authService.findOrCreateFromGoogle({
      googleId: profile.id,
      email,
      name,
    });
  }
}
