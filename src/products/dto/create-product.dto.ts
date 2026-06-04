import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Chanel No 5', description: 'Name of the product in English' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Шанел број 5', description: 'Name of the product in Macedonian' })
    @IsOptional()
    @IsString()
    name_mk?: string;

    @ApiPropertyOptional({ example: 'Classic floral fragrance', description: 'Description in English' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Класичен цветен мирис', description: 'Description in Macedonian' })
    @IsOptional()
    @IsString()
    description_mk?: string;

    @ApiProperty({ example: 120.50, description: 'Current price of the product' })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    price: number;

    @ApiPropertyOptional({ example: 150.00, description: 'Old price before discount' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    oldPrice?: number | null;

    @ApiPropertyOptional({ example: '-20%', description: 'Discount percentage or text' })
    @IsOptional()
    @IsString()
    discount?: string | null;

    @ApiPropertyOptional({ example: 50, description: 'Available stock quantity' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    stockQuantity?: number;

    @ApiPropertyOptional({ example: true, description: 'Indicates if product is in stock' })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    inStock?: boolean;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Main product image file' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({ type: [String], description: 'List of additional image URLs' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @ApiPropertyOptional({ example: 'Chanel', description: 'Brand of the product' })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiPropertyOptional({ example: 'uuid-string', description: 'ID of the category' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: true, description: 'Is this a popular product' })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isPopular?: boolean;

    @ApiPropertyOptional({ example: false, description: 'Is this a newly added product' })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isNew?: boolean;

    @ApiPropertyOptional({ example: 4.5, description: 'Average rating' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    rating?: number;

    @ApiPropertyOptional({ example: 24, description: 'Total number of reviews' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    reviewsCount?: number;
}