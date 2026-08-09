import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { Roles } from '../../common/auth';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('admin', 'staff', 'user')
  async findAll(
    @Query('includeDeleted') includeDeleted?: string,
    @Query('categoryId') categoryId?: string | string[],
    @Query('categoryIds') categoryIdsQuery?: string | string[],
  ) {
    const isIncludeDeleted = includeDeleted === 'true';

    let categoryIds: string[] = [];
    const rawCategoryInput = categoryIdsQuery ?? categoryId;
    if (Array.isArray(rawCategoryInput)) {
      categoryIds = rawCategoryInput
        .flatMap((id) => id.split(','))
        .map((id) => id.trim())
        .filter(Boolean);
    } else if (typeof rawCategoryInput === 'string' && rawCategoryInput.trim()) {
      categoryIds = rawCategoryInput
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    }

    const products = await this.productsService.getAllProducts(
      isIncludeDeleted,
      categoryIds.length > 0 ? categoryIds : undefined,
    );
    return { data: products };
  }

  @Get(':id')
  @Roles('admin', 'staff', 'user')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.getProductById(id);
    return { data: product };
  }

  @Post()
  @Roles('admin', 'staff')
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.createProduct(dto);
    return { data: product };
  }

  @Patch(':id')
  @Roles('admin', 'staff')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.updateProduct(id, dto);
    return { data: product };
  }

  @Delete(':id')
  @Roles('admin', 'staff')
  async remove(@Param('id') id: string) {
    await this.productsService.softDeleteProduct(id);
    return { data: { success: true } };
  }
}
