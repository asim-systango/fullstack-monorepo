import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentUser, Public, type AuthPrincipal } from '../../common/auth';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginSwagger } from './decorators/swagger/login.decorator';
import { LogoutSwagger } from './decorators/swagger/logout.decorator';
import { MeSwagger } from './decorators/swagger/me.decorator';
import { AUTH_ERRORS } from './constants/auth.constants';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginSwagger()
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      return await this.authService.login(dto, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case AUTH_ERRORS.INVALID_CREDENTIALS:
        case AUTH_ERRORS.USER_NOT_FOUND:
          throw new UnauthorizedException(message);
        case AUTH_ERRORS.USER_INACTIVE:
        case AUTH_ERRORS.ORGANIZATION_INACTIVE:
          throw new ForbiddenException(message);
        case AUTH_ERRORS.ORGANIZATION_MISMATCH:
          throw new BadRequestException(message);
        default:
          console.error('Error in AuthController.login:', error);
          throw new InternalServerErrorException(AUTH_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @LogoutSwagger()
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Get('me')
  @MeSwagger()
  me(@CurrentUser() user: AuthPrincipal) {
    return user;
  }
}
