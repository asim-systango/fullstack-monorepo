import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { CurrentUser, Public } from '../../common/auth';
import { User, UserRole, UsersService } from '../users';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

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
  @Get('me')
  me(@CurrentUser() user: User) {
    return this.userService.toPublic(user);
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
  staffOnlyTest(@CurrentUser() user: User) {
    return { message: `Hello staff member ${user.email}` };
  }
}
