import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProductRepository } from '../../database/repositories/ProductRepository';
import { CategoryRepository } from '../../database/repositories/CategoryRepository';
import { StockLevelRepository } from '../../database/repositories/StockLevelRepository';
import { StockMovementRepository } from '../../database/repositories/StockMovementRepository';
import { ProductEntity } from '../../database/entities/ProductEntity';

export type ProductWithTotalStock = ProductEntity & { totalQuantity: number };

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly stockLevelRepository: StockLevelRepository,
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  async getAllProducts(
    includeDeleted = false,
    categoryIds?: string[],
  ): Promise<ProductWithTotalStock[]> {
    const products = await this.productRepository.findAll(includeDeleted, categoryIds);
    return products.map((product) => this.attachTotalQuantity(product));
  }

  async getProductById(id: string): Promise<ProductWithTotalStock> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.attachTotalQuantity(product);
  }

  async createProduct(
    data: {
      sku: string;
      name: string;
      categoryId: string;
      description?: string;
      unit?: string;
      imageUrl?: string;
      initialStock?: { warehouseId: string; quantity: number }[];
    },
    user?: { id?: string; sub?: string; role?: string; warehouseId?: string | null },
  ): Promise<ProductWithTotalStock> {
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

    const created = await this.productRepository.create({
      sku: data.sku,
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      unit: data.unit,
      imageUrl: data.imageUrl,
    });

    if (data.initialStock && data.initialStock.length > 0) {
      const isStaff = user?.role === 'staff';
      const staffWarehouseId = user?.warehouseId;
      const userId = user?.id || user?.sub || '00000000-0000-0000-0000-000000000000';

      for (const stock of data.initialStock) {
        if (stock.quantity && stock.quantity > 0) {
          if (isStaff && staffWarehouseId && stock.warehouseId !== staffWarehouseId) {
            continue;
          }

          await this.stockLevelRepository.updateQuantity(
            stock.warehouseId,
            created.id,
            stock.quantity,
          );

          await this.stockMovementRepository.create({
            warehouseId: stock.warehouseId,
            productId: created.id,
            type: 'inbound',
            quantity: stock.quantity,
            reason: 'Initial stock intake on product creation',
            userId,
          });
        }
      }
    }

    const productWithRelations = await this.productRepository.findById(created.id);
    return this.attachTotalQuantity(productWithRelations || created);
  }

  async updateProduct(
    id: string,
    data: Partial<
      Pick<ProductEntity, 'name' | 'description' | 'unit' | 'categoryId' | 'imageUrl'>
    >,
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
