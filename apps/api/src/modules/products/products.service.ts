import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProductRepository } from '../../database/repositories/ProductRepository';
import { CategoryRepository } from '../../database/repositories/CategoryRepository';
import { ProductEntity } from '../../database/entities/ProductEntity';

export type ProductWithTotalStock = ProductEntity & { totalQuantity: number };

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async getAllProducts(
    includeDeleted = false,
    categoryId?: string,
  ): Promise<ProductWithTotalStock[]> {
    const products = await this.productRepository.findAll(includeDeleted, categoryId);
    return products.map((product) => this.attachTotalQuantity(product));
  }

  async getProductById(id: string): Promise<ProductWithTotalStock> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.attachTotalQuantity(product);
  }

  async createProduct(data: {
    sku: string;
    name: string;
    categoryId: string;
    description?: string;
    unit?: string;
  }): Promise<ProductWithTotalStock> {
    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${data.categoryId} not found`);
    }

    const existing = await this.productRepository.findBySku(data.sku);
    if (existing) {
      throw new ConflictException(
        `Product with SKU ${data.sku.toUpperCase()} already exists`,
      );
    }

    const created = await this.productRepository.create(data);
    return this.attachTotalQuantity(created);
  }

  async updateProduct(
    id: string,
    data: Partial<Pick<ProductEntity, 'name' | 'description' | 'unit' | 'categoryId'>>,
  ): Promise<ProductWithTotalStock> {
    await this.getProductById(id);
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new NotFoundException(`Category with ID ${data.categoryId} not found`);
      }
    }
    const updated = await this.productRepository.update(id, data);
    return this.attachTotalQuantity(updated!);
  }

  async softDeleteProduct(id: string): Promise<void> {
    await this.getProductById(id);
    await this.productRepository.softDelete(id);
  }

  private attachTotalQuantity(product: ProductEntity): ProductWithTotalStock {
    let totalQuantity = 0;
    if (product.stockLevels && Array.isArray(product.stockLevels)) {
      totalQuantity = product.stockLevels.reduce(
        (sum, level) => sum + (level.quantity || 0),
        0,
      );
    }
    return {
      ...product,
      totalQuantity,
    };
  }
}
