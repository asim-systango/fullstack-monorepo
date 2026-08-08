import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { Roles } from '../../common/auth';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Roles('admin', 'staff', 'user')
  async findAll() {
    const categories = await this.categoriesService.getAllCategories();
    return { data: categories };
  }

  @Get(':id')
  @Roles('admin', 'staff', 'user')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.getCategoryById(id);
    return { data: category };
  }

  @Post()
  @Roles('admin', 'staff')
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.createCategory(dto.name);
    return { data: category };
  }

  @Patch(':id')
  @Roles('admin', 'staff')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.categoriesService.updateCategory(id, dto.name);
    return { data: category };
  }

  @Delete(':id')
  @Roles('admin', 'staff')
  async remove(@Param('id') id: string) {
    await this.categoriesService.deleteCategory(id);
    return { data: { success: true } };
  }
}
