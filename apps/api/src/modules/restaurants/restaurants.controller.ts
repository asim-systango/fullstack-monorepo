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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Public, Roles, type JwtUser } from '../../common/auth';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { ListRestaurantsQueryDto } from './dto/list-restaurants-query.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsService } from './restaurants.service';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List restaurants (optional cuisine / search)' })
  @ApiOkResponse({ description: 'Paginated restaurants inside `{ data }`' })
  list(@Query() query: ListRestaurantsQueryDto) {
    return this.restaurantsService.list(query);
  }

  /** Must stay above `@Get(':id')` so `mine` is not parsed as a UUID. */
  @ApiBearerAuth()
  @Roles('staff', 'admin')
  @Get('mine')
  @ApiOperation({
    summary: 'The restaurant owned by the logged-in staff user',
  })
  @ApiOkResponse({ description: 'Single restaurant or null inside `{ data }`' })
  getMine(@CurrentUser() user: JwtUser) {
    return this.restaurantsService.getMine(user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get one restaurant by id' })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.getById(id);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a restaurant (admin)' })
  create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  @ApiBearerAuth()
  @Roles('admin', 'staff')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a restaurant (owner staff or admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.restaurantsService.update(id, dto, user);
  }
}
