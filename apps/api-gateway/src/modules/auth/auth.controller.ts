import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser, Public } from '../../common/auth';
import { PublicUser, UserRole } from '../users';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDTO, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  // Deliberately NOT @Public — requires authenticated cookie JWT.
  @ApiCookieAuth('access_token')
  @Get('me')
  @ApiOperation({ summary: 'Current user from cookie JWT' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid cookie' })
  me(@CurrentUser() user: PublicUser) {
    return user;
  }

  // Deliberately NOT @Public — any authenticated role may change their password.
  @Post('change-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Change password and clear mustChangePassword' })
  changePassword(@CurrentUser() user: PublicUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  // Public so clients can clear the cookie even with an expired/missing session.
  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  // Deliberately NOT @Public — staff-only probe behind RolesGuard.
  @Roles(UserRole.STAFF)
  @Get('staff-only-test')
  staffOnlyTest(@CurrentUser() user: PublicUser) {
    return { message: `Hello staff member ${user.email}` };
  }
}
