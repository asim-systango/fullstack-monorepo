import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AUTH_COOKIE_NAME } from '../../common/env';
import { CurrentUser, Public } from '../../common/auth';
import { PublicUser } from '../users';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates the account and sets httpOnly `access_token` cookie (signed in).',
  })
  @ApiOkResponse({ description: 'Public user profile; Set-Cookie applied' })
  register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.register(dto, res);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Log in',
    description: 'Sets httpOnly `access_token` cookie on success.',
  })
  @ApiOkResponse({ description: 'Public user profile; Set-Cookie applied' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log out (clears auth cookie)' })
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @ApiCookieAuth('access_token')
  @Get('me')
  @ApiOperation({ summary: 'Current user from cookie JWT' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid cookie' })
  me(@CurrentUser() user: PublicUser) {
    return user;
  }

  @ApiCookieAuth('access_token')
  @Get('ws-ticket')
  @ApiOperation({
    summary:
      'Return the session JWT for Socket.IO auth (httpOnly cookie cannot be read by JS)',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid cookie' })
  wsTicket(@Req() req: Request) {
    const token = (req.cookies as Record<string, string> | undefined)?.[AUTH_COOKIE_NAME];
    if (!token) {
      throw new UnauthorizedException('Missing auth cookie');
    }
    return { token };
  }
}
