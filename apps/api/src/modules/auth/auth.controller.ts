import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginSwagger } from './decorators/swagger/login.decorator';
import { ForgotPasswordSwagger } from './decorators/swagger/forgot-password.decorator';
import { ResetPasswordSwagger } from './decorators/swagger/reset-password.decorator';
import { ChangePasswordSwagger } from './decorators/swagger/change-password.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AUTH_ERRORS } from './constants/auth.constants';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginSwagger()
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ForgotPasswordSwagger()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(dto);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message === AUTH_ERRORS.USER_INACTIVE) {
        throw new ForbiddenException(message);
      }

      console.error('Error in AuthController.forgotPassword:', error);
      throw new InternalServerErrorException(AUTH_ERRORS.UNEXPECTED_ERROR);
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ResetPasswordSwagger()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(dto);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case AUTH_ERRORS.INVALID_RESET_TOKEN:
        case AUTH_ERRORS.EXPIRED_RESET_TOKEN:
        case AUTH_ERRORS.SAME_PASSWORD_ERROR:
          throw new BadRequestException(message);
        case AUTH_ERRORS.USER_NOT_FOUND:
          throw new UnauthorizedException(message);
        default:
          console.error('Error in AuthController.resetPassword:', error);
          throw new InternalServerErrorException(AUTH_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ChangePasswordSwagger()
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    try {
      const user = req.user as { id: string };
      return await this.authService.changePassword(user.id, dto);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case AUTH_ERRORS.INVALID_CREDENTIALS:
          throw new UnauthorizedException(message);
        case AUTH_ERRORS.SAME_PASSWORD_ERROR:
          throw new BadRequestException(message);
        case AUTH_ERRORS.USER_NOT_FOUND:
          throw new UnauthorizedException(message);
        default:
          console.error('Error in AuthController.changePassword:', error);
          throw new InternalServerErrorException(AUTH_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }
}
