import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { CheckoutRequestsService } from './checkout-requests.service';
import { CreateCheckoutRequestDto } from './dto/create-checkout-request.dto';
import { IssueCheckoutRequestDto } from './dto/issue-checkout-request.dto';
import { ListCheckoutRequestsQueryDto } from './dto/list-checkout-requests-query.dto';
import { RejectCheckoutRequestDto } from './dto/reject-checkout-request.dto';

@ApiTags('checkout-requests')
@ApiBearerAuth()
@Controller('checkout-requests')
export class CheckoutRequestsController {
  constructor(private readonly checkoutRequests: CheckoutRequestsService) {}

  @Roles('staff', 'admin')
  @Get()
  @ApiOperation({ summary: 'List checkout requests (staff/admin). Defaults to pending.' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  list(@Query() query: ListCheckoutRequestsQueryDto) {
    return this.checkoutRequests.list(query, { defaultPending: true });
  }

  @Roles('user')
  @Post()
  @ApiOperation({ summary: 'Request checkout of a title (member)' })
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateCheckoutRequestDto) {
    return this.checkoutRequests.create(user.id, dto);
  }

  @Roles('staff', 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get one checkout request (staff/admin)' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.checkoutRequests.findOne(id, { includeSuggestedDueDate: true });
  }

  @Roles('user')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel own pending checkout request' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  cancel(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.checkoutRequests.cancel(id, user.id);
  }

  @Roles('staff')
  @Post(':id/issue')
  @ApiOperation({ summary: 'Issue a physical copy against a pending request' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  issue(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: IssueCheckoutRequestDto,
  ) {
    return this.checkoutRequests.issue(id, user.id, dto);
  }

  @Roles('staff')
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a pending checkout request' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  reject(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RejectCheckoutRequestDto) {
    return this.checkoutRequests.reject(id, dto);
  }
}

@ApiTags('checkout-requests')
@ApiBearerAuth()
@Controller('my/checkout-requests')
export class MyCheckoutRequestsController {
  constructor(private readonly checkoutRequests: CheckoutRequestsService) {}

  @Roles('user')
  @Get()
  @ApiOperation({ summary: 'Authenticated member own checkout requests' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  listMine(@CurrentUser() user: JwtUser, @Query() query: ListCheckoutRequestsQueryDto) {
    return this.checkoutRequests.listMine(user.id, query);
  }
}
