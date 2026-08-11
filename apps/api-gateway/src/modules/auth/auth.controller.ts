import { Body, Controller, Get, HttpCode, Patch, Post, Req, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser, Public } from '../../common/auth';
import { PublicUser } from '../users';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new patient account' })
  @ApiOkResponse({
    description: 'Registration successful, returns Access & Refresh tokens + User',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Log in',
    description:
      'Returns Access Token & Refresh Token, sets httpOnly cookies on success.',
  })
  @ApiOkResponse({ description: 'Authentication successful' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiOkResponse({ description: 'Token refreshed successfully' })
  @ApiForbiddenResponse({ description: 'Invalid or expired refresh token' })
  refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(dto, req, res);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log out user and invalidate refresh token' })
  @ApiOkResponse({ description: 'Logout successful' })
  logout(@CurrentUser() user: PublicUser, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(user, res);
  }

  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  me(@CurrentUser() user: PublicUser) {
    return user;
  }

  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @Get('profile')
  @ApiOperation({ summary: 'Get current logged in user profile (alias for /me)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  profile(@CurrentUser() user: PublicUser) {
    return user;
  }

  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @Patch('profile')
  @ApiOperation({ summary: 'Update logged in user profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  updateProfile(
    @CurrentUser() user: PublicUser,
    @Body()
    dto: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string },
  ) {
    return this.authService.updateProfile(user.id, dto);
  }
}
