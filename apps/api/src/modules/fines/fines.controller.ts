import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { ListFinesQueryDto } from './dto/list-fines-query.dto';
import { WaiveFineDto } from './dto/waive-fine.dto';
import { FinesService } from './fines.service';

@ApiTags('fines')
@ApiBearerAuth()
@Controller('fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Roles('staff', 'admin')
  @Get()
  @ApiOperation({ summary: 'List all fines (staff/admin)' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  list(@Query() query: ListFinesQueryDto) {
    return this.finesService.list(query);
  }

  @Roles('staff', 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get fine by id' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.finesService.findOne(id);
  }

  @Roles('staff', 'admin')
  @Patch(':id/pay')
  @ApiOperation({ summary: 'Mark fine paid' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  markPaid(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.finesService.markPaid(id, user.id);
  }

  @Roles('staff', 'admin')
  @Patch(':id/waive')
  @ApiOperation({ summary: 'Waive fine with reason' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  waive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WaiveFineDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.finesService.waive(id, dto, user.id);
  }
}

@ApiTags('fines')
@ApiBearerAuth()
@Controller('my/fines')
export class MyFinesController {
  constructor(private readonly finesService: FinesService) {}

  @Roles('user')
  @Get()
  @ApiOperation({ summary: 'Authenticated member own fines' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  listMine(@CurrentUser() user: JwtUser, @Query() query: ListFinesQueryDto) {
    return this.finesService.listMine(user.id, query);
  }
}
