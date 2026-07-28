import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { loadApiEnv } from '../../common/env';
import { JwtStrategy } from './strategies/jwt.strategy';

const env = loadApiEnv();

/** Internal JWT validation only — no login/cookie endpoints (those live on api-gateway). */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: env.JWT_SECRET,
    }),
  ],
  providers: [JwtStrategy],
})
export class AuthModule {}
