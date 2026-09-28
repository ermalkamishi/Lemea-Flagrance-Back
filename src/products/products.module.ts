import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { BotMetaController } from '../common/bot-meta.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CloudinaryModule],
  controllers: [ProductsController, BotMetaController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}