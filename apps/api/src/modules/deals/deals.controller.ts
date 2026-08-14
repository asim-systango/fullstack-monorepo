import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UpdateDealStageDto } from './dto/update-deal-stage.dto';
import { User } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';
import { CurrentUser } from '../../common/auth';
import { SwaggerCreateDeal } from './decorators/swagger/create-deal.decorator';
import { SwaggerGetAllDeals } from './decorators/swagger/get-all-deals.decorator';
import { SwaggerUpdateDeal } from './decorators/swagger/update-deal.decorator';
import { SwaggerUpdateDealStage } from './decorators/swagger/update-deal-stage.decorator';
import { DEALS_ERRORS, DEALS_MESSAGES } from './constants/deals.constants';

@ApiTags('Deals')
@ApiBearerAuth()
@Controller('api/v1/deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @HttpCode(HttpStatus.CREATED)
  @SwaggerCreateDeal()
  async createDeal(@Body() createDealDto: CreateDealDto, @CurrentUser() user: User) {
    try {
      const deal = await this.dealsService.createDeal(
        createDealDto,
        user,
        user.role?.name || '',
      );

      return {
        message: DEALS_MESSAGES.DEAL_CREATED,
        data: deal,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case DEALS_ERRORS.USER_NO_ORG:
        case DEALS_ERRORS.UNAUTHORIZED_ACCESS:
          throw new ForbiddenException(message);
        case DEALS_ERRORS.LEAD_NOT_FOUND:
        case DEALS_ERRORS.CONTACT_NOT_FOUND:
        case DEALS_ERRORS.OWNER_NOT_FOUND:
          throw new NotFoundException(message);
        case DEALS_ERRORS.LEAD_ALREADY_CONVERTED:
          throw new ConflictException(message);
        default:
          console.error('Error in createDeal:', error);
          throw new InternalServerErrorException(DEALS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerGetAllDeals()
  async getAllDeals(@CurrentUser() user: User) {
    try {
      const deals = await this.dealsService.getAllDeals(user, user.role?.name || '');

      return {
        message: DEALS_MESSAGES.DEALS_RETRIEVED,
        data: deals,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message === DEALS_ERRORS.USER_NO_ORG) {
        throw new ForbiddenException(message);
      }

      console.error('Error in getAllDeals:', error);
      throw new InternalServerErrorException(DEALS_ERRORS.UNEXPECTED_ERROR);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerUpdateDeal()
  async updateDeal(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
    @CurrentUser() user: User,
  ) {
    try {
      const deal = await this.dealsService.updateDeal(id, updateDealDto, user);

      return {
        message: DEALS_MESSAGES.DEAL_UPDATED,
        data: deal,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case DEALS_ERRORS.USER_NO_ORG:
        case DEALS_ERRORS.UNAUTHORIZED_ACCESS:
          throw new ForbiddenException(message);
        case DEALS_ERRORS.DEAL_NOT_FOUND:
        case DEALS_ERRORS.OWNER_NOT_FOUND:
          throw new NotFoundException(message);
        default:
          console.error('Error in updateDeal:', error);
          throw new InternalServerErrorException(DEALS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }

  @Patch(':id/stage')
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerUpdateDealStage()
  async updateDealStage(
    @Param('id') id: string,
    @Body() updateDealStageDto: UpdateDealStageDto,
    @CurrentUser() user: User,
  ) {
    try {
      const deal = await this.dealsService.updateDealStage(
        id,
        updateDealStageDto,
        user,
        user.role?.name || '',
      );

      return {
        message: DEALS_MESSAGES.DEAL_STAGE_UPDATED,
        data: deal,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case DEALS_ERRORS.USER_NO_ORG:
        case DEALS_ERRORS.UNAUTHORIZED_ACCESS:
          throw new ForbiddenException(message);
        case DEALS_ERRORS.DEAL_NOT_FOUND:
          throw new NotFoundException(message);
        default:
          console.error('Error in updateDealStage:', error);
          throw new InternalServerErrorException(DEALS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }
}
