import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryRepository } from '../../database/repositories/CategoryRepository';
import { CategoryEntity } from '../../database/entities/CategoryEntity';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getAllCategories(): Promise<CategoryEntity[]> {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async createCategory(name: string): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findByName(name);
    if (existing) {
      throw new ConflictException(`Category "${name}" already exists`);
    }
    return this.categoryRepository.create(name);
  }

  async updateCategory(id: string, name: string): Promise<CategoryEntity> {
    await this.getCategoryById(id);
    const updated = await this.categoryRepository.update(id, name);
    return updated!;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.getCategoryById(id);
    await this.categoryRepository.delete(id);
  }
}
