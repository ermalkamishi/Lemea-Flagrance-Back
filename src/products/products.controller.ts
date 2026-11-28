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
  NotFoundException,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Product photos: one image file, max 10 MB (Cloudinary's free-plan image limit).
const IMAGE_UPLOAD_OPTIONS = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req: any, file: Express.Multer.File, cb: (error: Error | null, accept: boolean) => void) => {
    if (file.mimetype?.startsWith('image/')) return cb(null, true);
    cb(new BadRequestException('Only image files can be uploaded'), false);
  },
};

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', IMAGE_UPLOAD_OPTIONS))
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
  @ApiOperation({ summary: 'List all products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id or slug' })
  async findOne(@Param('id') id: string) {
    // Accepts a UUID or a name slug; returns 404 instead of a Postgres "invalid uuid" 500
    const product = await this.productsService.findByIdOrSlug(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', IMAGE_UPLOAD_OPTIONS))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
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

    // Remove undefined fields to avoid overwriting with null in TypeORM
    const cleanData: any = { ...productData };
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === undefined) delete cleanData[key];
    });

    return this.productsService.update(id, cleanData);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
