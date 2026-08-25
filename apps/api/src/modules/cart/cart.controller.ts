import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@ApiBearerAuth()
@Roles('user', 'admin')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user cart' })
  getCart(@CurrentUser() user: JwtUser) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({
    summary: 'Add a menu item to the cart',
    description: 'Fails with 400 if the cart already has items from another restaurant.',
  })
  addItem(@CurrentUser() user: JwtUser, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity (0 removes it)' })
  updateItem(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, id, dto.quantity);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the whole cart' })
  clear(@CurrentUser() user: JwtUser) {
    return this.cartService.clearCart(user.id);
  }
}
