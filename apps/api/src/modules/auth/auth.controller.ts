import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginSwagger } from './decorators/swagger/login.decorator';
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
}
