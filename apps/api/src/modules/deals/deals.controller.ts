import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
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
import { GetDealsDto } from './dto/get-deals.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UpdateDealStageDto } from './dto/update-deal-stage.dto';
import { User } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';
import { CurrentUser } from '../../common/auth';
import { SwaggerCreateDeal } from './decorators/swagger/create-deal.decorator';
import { SwaggerGetAllDeals } from './decorators/swagger/get-all-deals.decorator';
import { SwaggerGetDealDetails } from './decorators/swagger/get-deal-details.decorator';
import { SwaggerUpdateDeal } from './decorators/swagger/update-deal.decorator';
import { SwaggerUpdateDealStage } from './decorators/swagger/update-deal-stage.decorator';
import { DEALS_ERRORS, DEALS_MESSAGES } from './constants/deals.constants';

@ApiTags('Deals')
@ApiBearerAuth()
@Controller('api/v1/deals')
@UseGuards(JwtAuthGuard, RoutePermissionGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @SwaggerGetAllDeals()
  async getDeals(@Query() query: GetDealsDto, @CurrentUser() user: User) {
    try {
      const result = await this.dealsService.getDeals(
        user,
        user.role?.name || '',
        query,
      );

      return {
        message: DEALS_MESSAGES.DEALS_RETRIEVED,
        ...result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message === DEALS_ERRORS.USER_NO_ORG) {
        throw new ForbiddenException(message);
      }

      console.error('Error in getDeals:', error);
      throw new InternalServerErrorException(DEALS_ERRORS.UNEXPECTED_ERROR);
    }
  }

  @Post()
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

  @Patch(':id')
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SwaggerGetDealDetails()
  async getDealDetails(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      const deal = await this.dealsService.getDealDetails(
        id,
        user,
        user.role?.name || '',
      );

      return {
        message: DEALS_MESSAGES.DEAL_RETRIEVED,
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
          console.error('Error in getDealDetails:', error);
          throw new InternalServerErrorException(DEALS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }
}
