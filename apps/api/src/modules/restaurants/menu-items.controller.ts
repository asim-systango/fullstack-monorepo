import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Public, Roles, type JwtUser } from '../../common/auth';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { ListMenuItemsQueryDto } from './dto/list-menu-items-query.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemsService } from './menu-items.service';

@ApiTags('menu-items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List menu items for a restaurant',
    description: 'Soft-deleted items are hidden unless includeDeleted=true (staff/admin).',
  })
  list(
    @Query() query: ListMenuItemsQueryDto,
    @CurrentUser() user: JwtUser | null,
  ) {
    return this.menuItemsService.list(query, user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get one active menu item' })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuItemsService.getById(id);
  }

  @ApiBearerAuth()
  @Roles('staff', 'admin')
  @Post()
  @ApiOperation({ summary: 'Create a menu item (restaurant staff)' })
  create(@Body() dto: CreateMenuItemDto, @CurrentUser() user: JwtUser) {
    return this.menuItemsService.create(dto, user);
  }

  @ApiBearerAuth()
  @Roles('staff', 'admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a menu item' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.menuItemsService.update(id, dto, user);
  }

  @ApiBearerAuth()
  @Roles('staff', 'admin')
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft-delete a menu item' })
  @ApiNoContentResponse({ description: 'Menu item marked deleted' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    await this.menuItemsService.softDelete(id, user);
  }
}
