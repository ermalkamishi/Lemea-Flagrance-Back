import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: any) {
    let imageUrl = createProductDto.image;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadFile(file);
    }

    const productData = {
      ...createProductDto,
      image: imageUrl,
      images: imageUrl ? [imageUrl] : (createProductDto.images || []),
    };

    return this.productsService.create(productData as CreateProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: any,
  ) {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadFile(file);
    }

    const productData = {
      ...updateProductDto,
      ...(imageUrl ? { image: imageUrl, images: [imageUrl] } : {}),
    };

    console.log('Update Received:', updateProductDto);
    console.log('Final Data for TypeORM:', productData);

    // Remove undefined fields to avoid overwriting with null in TypeORM
    const cleanData: any = { ...productData };
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === undefined) delete cleanData[key];
    });

    return this.productsService.update(id, cleanData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}