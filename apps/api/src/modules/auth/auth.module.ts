import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { loadApiEnv } from '../../common/env';
import { JwtStrategy } from './strategies/jwt.strategy';

const env = loadApiEnv();

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
