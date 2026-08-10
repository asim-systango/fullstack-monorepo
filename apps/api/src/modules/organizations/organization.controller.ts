import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { OnboardOrganizationDto } from './dto/onboard-organization.dto';
import { OnboardOrganizationSwagger } from './decorators/swagger/onboard-organization.decorator';
import { ORGANIZATION_ERRORS } from './constants/organization.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';

@ApiTags('Organizations')
@Controller('api/v1/organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('onboard')
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @HttpCode(HttpStatus.CREATED)
  @OnboardOrganizationSwagger()
  async onboardOrganization(@Body() dto: OnboardOrganizationDto) {
    try {
      return await this.organizationService.onboardOrganization(dto);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case ORGANIZATION_ERRORS.INVALID_ORGANIZATION_NAME:
          throw new BadRequestException(message);
        case ORGANIZATION_ERRORS.DOMAIN_ALREADY_EXISTS:
        case ORGANIZATION_ERRORS.SLUG_ALREADY_EXISTS:
        case ORGANIZATION_ERRORS.ADMIN_EMAIL_ALREADY_EXISTS:
          throw new ConflictException(message);
        case ORGANIZATION_ERRORS.ORG_ADMIN_ROLE_NOT_FOUND:
          throw new NotFoundException(message);
        default:
          console.error('Error in onboardOrganization:', error);
          throw new InternalServerErrorException(ORGANIZATION_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }
}
