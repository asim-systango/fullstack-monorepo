import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public, Roles, type JwtUser } from '../../common/auth';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { GetAuctionQueryDto } from './dto/get-auction-query.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';

@ApiTags('auctions')
@ApiBearerAuth()
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Roles('staff')
  @Post()
  @ApiOperation({ summary: 'Create an auction (seller / staff only)' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateAuctionDto) {
    return this.auctionsService.create(dto, user.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all auctions' })
  findAll(@Query() query: GetAuctionQueryDto) {
    return this.auctionsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get auction by ID' })
  findAuctionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctionsService.findAuctionById(id);
  }

  @Roles('staff')
  @Patch(':id')
  @ApiOperation({ summary: 'Update auction by ID (staff only)' })
  updateAuctionById(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAuctionDto,
  ) {
    return this.auctionsService.updateAuction(id, dto, user.id);
  }

  @Roles('staff', 'admin')
  @Post(':id/close')
  @ApiOperation({ summary: 'Close an auction' })
  closeAuction(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.auctionsService.closeAuction(id, user);
  }
}
