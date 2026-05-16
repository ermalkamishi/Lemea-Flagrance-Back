import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productRepository.update(id, updateProductDto);
  }

  remove(id: string) {
    return this.productRepository.delete(id);
  }

  async decrementStock(productId: string, quantity: number) {
    console.log(`decrementStock called for ID: ${productId}, Qty: ${quantity}`);
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (product) {
      console.log(`Found product: ${product.name}, Current Stock: ${product.stockQuantity}`);
      product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
      if (product.stockQuantity === 0) {
        product.inStock = false;
      }
      await this.productRepository.save(product);
      console.log(`Updated stock for ${product.name} to ${product.stockQuantity}`);
    } else {
      console.error(`Product with ID ${productId} not found in database!`);
    }
  }
}