import { Body, Controller, Get, HttpCode, Patch, Post, Res } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentUser, Public } from '../../common/auth';
import { PublicUser } from '../users';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { PublicUserDto } from './dto/public-user.dto';
import { SaveDeliveryAddressDto } from './dto/save-delivery-address.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({
    summary: 'Register a new customer account',
    description:
      'Creates a user with role `user`, then sets the httpOnly `access_token` cookie.',
  })
  @ApiCreatedResponse({ type: PublicUserDto, description: 'Public profile + Set-Cookie' })
  @ApiConflictResponse({ description: 'Email already registered' })
  register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(dto, res);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Log in',
    description: 'Validates email/password and sets httpOnly `access_token` cookie.',
  })
  @ApiOkResponse({ type: PublicUserDto, description: 'Public profile + Set-Cookie' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log out (clears auth cookie)' })
  @ApiOkResponse({ description: '{ ok: true }' })
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @ApiCookieAuth('access_token')
  @Get('me')
  @ApiOperation({
    summary: 'Current user from cookie JWT',
    description: 'Protected by JwtAuthGuard. Cookie is validated against the users table.',
  })
  @ApiOkResponse({ type: PublicUserDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid cookie' })
  me(@CurrentUser() user: PublicUser) {
    return user;
  }

  @ApiCookieAuth('access_token')
  @Patch('address')
  @ApiOperation({
    summary: 'Save delivery address for checkout',
    description: 'Stored on the user profile and reused on future orders.',
  })
  @ApiOkResponse({ type: PublicUserDto })
  saveAddress(
    @CurrentUser() user: PublicUser,
    @Body() dto: SaveDeliveryAddressDto,
  ) {
    return this.authService.saveDeliveryAddress(user.id, dto.deliveryAddress);
  }
}
