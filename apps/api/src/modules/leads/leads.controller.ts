import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { User } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';
import { CurrentUser } from '../../common/auth';
import { SwaggerCreateLead } from './decorators/swagger/create-lead.decorator';
import { LEADS_ERRORS, LEADS_MESSAGES } from './constants/leads.constants';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('api/v1/leads')
@UseGuards(JwtAuthGuard, RoutePermissionGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SwaggerCreateLead()
  async createLead(@Body() createLeadDto: CreateLeadDto, @CurrentUser() user: User) {
    try {
      const lead = await this.leadsService.createLead(createLeadDto, user);

      return {
        message: LEADS_MESSAGES.LEAD_CREATED,
        data: lead,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case LEADS_ERRORS.USER_NO_ORG:
        case LEADS_ERRORS.UNAUTHORIZED_ACCESS:
          throw new ForbiddenException(message);
        case LEADS_ERRORS.CONTACT_NOT_FOUND:
        case LEADS_ERRORS.OWNER_NOT_FOUND:
          throw new NotFoundException(message);
        default:
          console.error('Error in createLead:', error);
          throw new InternalServerErrorException(LEADS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }
}
