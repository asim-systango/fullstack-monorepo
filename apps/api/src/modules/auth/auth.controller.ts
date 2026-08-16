import { Body, Controller, Get, HttpCode, Patch, Post, Res } from '@nestjs/common';
import {
  ApiCookieAuth,
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
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  RequestChangePasswordOtpDto,
  ResendOtpDto,
  ResetPasswordDto,
  UpdateMeDto,
  VerifyOtpDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({
    summary: 'Register a member',
    description:
      'Creates an unverified user (role=user) and emails a signup OTP. Does not create member_profile yet.',
  })
  @ApiOkResponse({ description: 'Public user profile (envelope `{ data }`)' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-otp')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify signup OTP',
    description:
      'Sets email_verified_at then provisions member_profile (one-shot). No session cookie.',
  })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('resend-otp')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend signup or password-reset OTP' })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request password reset OTP',
    description: 'Always returns ok. Sends OTP only for verified accounts.',
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reset password with OTP',
    description:
      'Requires password_reset OTP. Clears OTP fields. No session — redirect to login.',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Log in',
    description:
      'Returns accessToken + refreshToken (+ user). Also sets httpOnly access_token cookie for the web BFF.',
  })
  @ApiOkResponse({
    description: '{ user, accessToken, refreshToken }; Set-Cookie applied',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh tokens',
    description:
      'Exchanges a valid refreshToken for a new accessToken + refreshToken pair.',
  })
  refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(dto, res);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Log out',
    description: 'Clears auth cookie and optionally revokes the provided refreshToken.',
  })
  logout(@Res({ passthrough: true }) res: Response, @Body() dto: LogoutDto = {}) {
    return this.authService.logout(res, dto.refreshToken);
  }

  @ApiCookieAuth('access_token')
  @Get('me')
  @ApiOperation({ summary: 'Current user from cookie JWT' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid cookie' })
  me(@CurrentUser() user: PublicUser) {
    return user;
  }

  @ApiCookieAuth('access_token')
  @Patch('me')
  @ApiOperation({ summary: 'Update own name / email' })
  updateMe(@CurrentUser() user: PublicUser, @Body() dto: UpdateMeDto) {
    return this.authService.updateMe(user.id, dto);
  }

  @ApiCookieAuth('access_token')
  @Post('change-password/otp')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Email an OTP to confirm a password change',
    description:
      'Requires the current password. Sends a 6-digit code to the signed-in account.',
  })
  requestChangePasswordOtp(
    @CurrentUser() user: PublicUser,
    @Body() dto: RequestChangePasswordOtpDto,
  ) {
    return this.authService.requestChangePasswordOtp(user.id, dto);
  }

  @ApiCookieAuth('access_token')
  @Post('change-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Change password (requires current password and OTP)',
    description:
      'Verifies the emailed OTP, updates the password, revokes sessions, and clears the auth cookie. Client should redirect to login.',
  })
  changePassword(
    @CurrentUser() user: PublicUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.changePassword(user.id, dto, res);
  }
}
