import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    return this.productRepository.save(createProductDto);
  }

  findAll() {
    return this.productRepository.find();
  }

  findOne(id: string) {
    return this.productRepository.findOne({ where: { id } });
  }

  findBySlug(slug: string) {
    const normalized = slug.replace(/[-_]+/g, ' ').trim();
    return this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.name) = LOWER(:normalized)', { normalized })
      .orWhere('LOWER(product.name) LIKE LOWER(:likePattern)', {
        likePattern: `%${normalized}%`,
      })
      .getOne();
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Product | null> {
    if (UUID_REGEX.test(idOrSlug)) {
      return this.findOne(idOrSlug);
    }
    return this.findBySlug(idOrSlug);
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productRepository.update(id, updateProductDto);
  }

  remove(id: string) {
    return this.productRepository.delete(id);
  }

  /**
   * Atomically decrements stock in a single UPDATE so two simultaneous orders
   * can't both read the same old value and overwrite each other.
   * Stock never goes below 0, and the product is marked out of stock when it hits 0.
   */
  async decrementStock(productId: string, quantity: number) {
    const qty = Math.floor(Number(quantity));
    if (!UUID_REGEX.test(productId) || !Number.isFinite(qty) || qty <= 0) {
      return;
    }
    await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        stockQuantity: () => 'GREATEST("stockQuantity" - :qty, 0)',
        inStock: () => 'CASE WHEN "stockQuantity" - :qty <= 0 THEN false ELSE "inStock" END',
      })
      .where('id = :id', { id: productId })
      .setParameter('qty', qty)
      .execute();
  }
}
