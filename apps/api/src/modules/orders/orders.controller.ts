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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('user', 'staff', 'admin')
  @Get()
  @ApiOperation({
    summary: 'List orders',
    description:
      'Use scope=mine for orders you placed, scope=restaurant for kitchen queue (staff), scope=all for admin.',
  })
  list(@CurrentUser() user: JwtUser, @Query() query: ListOrdersQueryDto) {
    return this.ordersService.list(user, query);
  }

  @Roles('user', 'staff', 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get one order with lines + delivery timeline' })
  getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ordersService.getById(id, user);
  }

  @Roles('user', 'admin')
  @Post()
  @ApiOperation({
    summary: 'Place order from cart',
    description:
      'Creates order + lines + first delivery status, then clears the cart. Payment is created via POST /orders/:id/payments.',
  })
  place(@CurrentUser() user: JwtUser, @Body() dto: PlaceOrderDto) {
    return this.ordersService.placeOrder(user, dto);
  }

  @Roles('staff', 'admin')
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Advance order status (kitchen)',
    description: 'Only one-step forward transitions are allowed.',
  })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ordersService.updateStatus(id, dto.status, user);
  }
}
