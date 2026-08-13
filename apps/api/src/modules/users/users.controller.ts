import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/auth';
import { InviteUserSwagger } from './decorators/swagger/invite-user.decorator';
import { User } from '../../database/entities/user.entity';
import { RoleName } from '../../database/entities/role.entity';
import { USERS_ERRORS } from './constants/users.constants';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @InviteUserSwagger()
  async inviteUser(@CurrentUser() user: User, @Body() dto: InviteUserDto) {
    try {
      return await this.usersService.inviteUser(
        user.id,
        user.organizationId,
        user.role?.name as RoleName,
        dto,
      );
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case USERS_ERRORS.NOT_ORGANIZATION_MEMBER:
          case USERS_ERRORS.ROLE_NOT_ALLOWED_TO_INVITE:
            throw new ForbiddenException(error.message);
          case USERS_ERRORS.USER_ALREADY_EXISTS:
            throw new ConflictException(error.message);
          case USERS_ERRORS.ROLE_NOT_FOUND:
          case USERS_ERRORS.ORGANIZATION_NOT_FOUND:
            throw new NotFoundException(error.message);
          default:
            throw new InternalServerErrorException(error.message);
        }
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
