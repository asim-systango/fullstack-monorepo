import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
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
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStageDto } from './dto/update-lead-stage.dto';
import { User } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';
import { CurrentUser } from '../../common/auth';
import { SwaggerCreateLead } from './decorators/swagger/create-lead.decorator';
import { SwaggerUpdateLead } from './decorators/swagger/update-lead.decorator';
import { SwaggerUpdateLeadStage } from './decorators/swagger/update-lead-stage.decorator';
import { SwaggerGetLeadDetails } from './decorators/swagger/get-lead-details.decorator';
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

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @SwaggerUpdateLead()
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: User,
  ) {
    try {
      const lead = await this.leadsService.updateLead(id, updateLeadDto, user);

      return {
        message: LEADS_MESSAGES.LEAD_UPDATED,
        data: lead,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case LEADS_ERRORS.USER_NO_ORG:
          throw new ForbiddenException(message);
        case LEADS_ERRORS.LEAD_NOT_FOUND:
        case LEADS_ERRORS.CONTACT_NOT_FOUND:
        case LEADS_ERRORS.OWNER_NOT_FOUND:
          throw new NotFoundException(message);
        default:
          console.error('Error in updateLead:', error);
          throw new InternalServerErrorException(LEADS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }

  @Patch(':id/stage')
  @HttpCode(HttpStatus.OK)
  @SwaggerUpdateLeadStage()
  async updateLeadStage(
    @Param('id') id: string,
    @Body() updateLeadStageDto: UpdateLeadStageDto,
    @CurrentUser() user: User,
  ) {
    try {
      const lead = await this.leadsService.updateLeadStage(
        id,
        updateLeadStageDto,
        user,
        user.role?.name || '',
      );

      return {
        message: LEADS_MESSAGES.LEAD_STAGE_UPDATED,
        data: lead,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case LEADS_ERRORS.USER_NO_ORG:
        case LEADS_ERRORS.UNAUTHORIZED_ACCESS:
          throw new ForbiddenException(message);
        case LEADS_ERRORS.LEAD_NOT_FOUND:
          throw new NotFoundException(message);
        default:
          console.error('Error in updateLeadStage:', error);
          throw new InternalServerErrorException(LEADS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SwaggerGetLeadDetails()
  async getLeadDetails(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      const lead = await this.leadsService.getLeadDetails(
        id,
        user,
        user.role?.name || '',
      );

      return {
        message: LEADS_MESSAGES.LEAD_RETRIEVED,
        data: lead,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case LEADS_ERRORS.USER_NO_ORG:
        case LEADS_ERRORS.UNAUTHORIZED_ACCESS:
          throw new ForbiddenException(message);
        case LEADS_ERRORS.LEAD_NOT_FOUND:
          throw new NotFoundException(message);
        default:
          console.error('Error in getLeadDetails:', error);
          throw new InternalServerErrorException(LEADS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }
}
