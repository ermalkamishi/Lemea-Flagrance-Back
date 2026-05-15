import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  private async seedCategories() {
    const count = await this.categoryRepository.count();
    if (count > 0) {
      return;
    }

    console.log('Seeding initial categories...');

    const categoriesToSeed = [
      { name: 'Parfume', description: 'Premium perfumes and fragrances' },
      { name: 'Body Mist', description: 'Body mists and sprays' },
      { name: 'Rhode Blush', description: 'Rhode blush products' },
    ];

    for (const cat of categoriesToSeed) {
      const newCategory = this.categoryRepository.create(cat);
      await this.categoryRepository.save(newCategory);
    }

    console.log('Successfully seeded categories!');
  }

  create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: string) {
    return this.categoryRepository.findOne({ where: { id } });
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryRepository.update(id, updateCategoryDto);
  }

  remove(id: string) {
    return this.categoryRepository.delete(id);
  }
}
